'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { decrypt } from '@/lib/crypto'
import { cvHTML } from '@/services/cv.service'
import type { AnalysisResult, UserConfig, CvData } from '@/types'
import type { User } from 'firebase/auth'

export interface BulkItem {
  id: string
  file: File
  status: 'pending' | 'analyzing' | 'done' | 'error' | 'sent'
  error?: string
  result?: AnalysisResult
  editable: {
    subjek: string
    nama_perusahaan: string
    posisi: string
    intro: string
    alasan: string
    penutup: string
    email: string
  }
  selected: boolean
  expanded: boolean
  sending: boolean
}

interface ProcessingContextType {
  config: UserConfig | null
  items: BulkItem[]
  bulkRunning: boolean
  bulkProgress: { done: number; total: number }
  sendingBulk: boolean
  addFiles: (files: File[]) => void
  removeItem: (id: string) => void
  toggleSelect: (id: string) => void
  toggleExpanded: (id: string) => void
  updateItem: (id: string, patch: Partial<BulkItem>) => void
  analyzeAllPending: () => void
  analyzeSingle: (item: BulkItem) => Promise<void>
  sendAllDone: () => void
  sendSingleItem: (item: BulkItem) => Promise<void>
  clearAll: () => void
  setUpgradeOpen: (open: boolean) => void
  upgradeOpen: boolean
}

const ProcessingContext = createContext<ProcessingContextType | null>(null)

export function useProcessing() {
  const ctx = useContext(ProcessingContext)
  if (!ctx) throw new Error('useProcessing must be used within ProcessingProvider')
  return ctx
}

const planLimits: Record<string, { analyze: number; send: number }> = {
  free: { analyze: 3, send: 3 },
  basic: { analyze: 20, send: 20 },
  starter: { analyze: 80, send: 80 },
  pro: { analyze: Infinity, send: Infinity },
}

export function ProcessingProvider({
  children,
  user,
  config,
  onConfigUpdate,
}: {
  children: ReactNode
  user: User | null
  config: UserConfig | null
  onConfigUpdate: (c: UserConfig) => void
}) {
  const [items, setItems] = useState<BulkItem[]>([])
  const [bulkRunning, setBulkRunning] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })
  const [sendingBulk, setSendingBulk] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const configRef = useRef(config)
  configRef.current = config
  const userRef = useRef(user)
  userRef.current = user
  const cvPdfUrlRef = useRef<string | null>(null)

  const getCvDataPdfUrl = useCallback(async (): Promise<string | null> => {
    if (cvPdfUrlRef.current) return cvPdfUrlRef.current
    const u = userRef.current
    if (!u || !db) return null
    const snap = await getDoc(doc(db, 'users', u.uid))
    if (!snap.exists()) return null
    const data = snap.data().cvData as CvData | undefined
    if (!data || !data.personalInfo?.fullName) return null

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-9999px'
    iframe.style.top = '0'
    iframe.style.width = '595px'
    iframe.style.height = '842px'
    iframe.style.border = 'none'
    iframe.style.opacity = '0'
    document.body.appendChild(iframe)
    const doc2 = iframe.contentDocument!
    doc2.open()
    doc2.write(`<!DOCTYPE html><html><head><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family:'Inter','Segoe UI',sans-serif; color:#111827; background:#fff; padding:40px; font-size:11px; line-height:1.5; }
      h1 { font-size:22px; font-weight:700; text-transform:uppercase; letter-spacing:-0.5px; margin-bottom:2px; }
      h2 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:12px 0 4px; padding-bottom:2px; border-bottom:1px solid #d1d5db; }
      .contact { font-size:10px; color:#6b7280; margin-bottom:16px; } .contact span { margin-right:12px; }
      .section { margin-bottom:10px; }
      .exp-header { display:flex; justify-content:space-between; font-weight:600; font-size:12px; }
      .exp-company { font-size:10px; color:#6b7280; }
      ul { list-style:disc; padding-left:16px; margin-top:2px; }
      li { font-size:11px; color:#374151; margin-bottom:1px; }
      .summary { font-size:11px; color:#374151; line-height:1.6; margin-bottom:10px; }
      .skill-line { font-size:11px; margin-bottom:1px; }
      .cert-line { font-size:11px; margin-bottom:1px; }
      .lang-line { font-size:11px; }
    </style></head><body>${cvHTML(data, data.language || 'id')}</body></html>`)
    doc2.close()
    await new Promise(r => setTimeout(r, 300))

    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(doc2.body, { scale: 2, backgroundColor: '#ffffff', logging: false })
    document.body.removeChild(iframe)

    const tc = document.createElement('canvas')
    tc.width = canvas.width; tc.height = canvas.height
    const ctx = tc.getContext('2d', { colorSpace: 'srgb' })!
    ctx.drawImage(canvas, 0, 0)
    const jpegData = tc.toDataURL('image/jpeg', 0.92)

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pw = pdf.internal.pageSize.getWidth()
    const ph = (canvas.height * pw) / canvas.width
    pdf.addImage(jpegData, 'JPEG', 0, 0, pw, ph)
    cvPdfUrlRef.current = pdf.output('datauristring')
    return cvPdfUrlRef.current
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<BulkItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const addFiles = useCallback((files: File[]) => {
    const newItems: BulkItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: 'pending',
      editable: { subjek: '', nama_perusahaan: '', posisi: '', intro: '', alasan: '', penutup: '', email: '' },
      selected: true,
      expanded: false,
      sending: false,
    }))
    setItems((prev) => [...prev, ...newItems])
    setTimeout(() => { analyzeAllPending() }, 100)
  }, [])

  const analyzeSingle = useCallback(async (item: BulkItem) => {
    updateItem(item.id, { status: 'analyzing', error: undefined })
    try {
      const toBase64 = (f: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(f)
        })
      const imageData = await toBase64(item.file)
      const u = userRef.current
      if (!u) return
      const token = await u.getIdToken()
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          imageData, mimeType: item.file.type, uid: u.uid,
          senderName: configRef.current?.senderName || u.displayName || '',
          language: configRef.current?.analyzeLanguage || 'id',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menganalisis')

      const result = data as AnalysisResult
      updateItem(item.id, {
        status: 'done', result,
        editable: {
          subjek: decrypt(result.subjek), nama_perusahaan: result.nama_perusahaan,
          posisi: result.posisi, intro: decrypt(result.intro),
          alasan: decrypt(result.alasan), penutup: decrypt(result.penutup), email: result.email,
        },
        expanded: true,
      })
      const c = configRef.current
      if (db && c) {
        await updateDoc(doc(db, 'users', u.uid), { usageAnalyze: increment(1) })
        onConfigUpdate({ ...c, usageAnalyze: c.usageAnalyze + 1 })
      }
    } catch (e) {
      updateItem(item.id, { status: 'error', error: e instanceof Error ? e.message : 'Gagal menganalisis' })
    }
  }, [updateItem, onConfigUpdate])

  const sendSingleItem = useCallback(async (item: BulkItem) => {
    const c = configRef.current
    const u = userRef.current
    if (!c || !u) return

    if (!c.smtpPass) {
      updateItem(item.id, { status: 'error', error: 'App password not configured. Please set it in profile settings.', sending: false })
      return
    }

    const pdfUrl = await getCvDataPdfUrl()
    if (!pdfUrl && !c.cvPath) {
      updateItem(item.id, { status: 'error', error: 'CV not found. Please upload it in profile settings or create one in CV Builder.', sending: false })
      return
    }
    if (!item.editable.email) {
      updateItem(item.id, { status: 'error', error: 'Recipient email is required.', sending: false })
      return
    }

    updateItem(item.id, { sending: true })
    try {
      const token = await u.getIdToken()
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subjek: item.editable.subjek, intro: item.editable.intro,
          alasan: item.editable.alasan, penutup: item.editable.penutup,
          email: item.editable.email, fileUrl: pdfUrl || c.cvPath, fileName: 'CV.pdf',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403 && data.usage) { setUpgradeOpen(true) }
        else { throw new Error(data.error || 'Send failed') }
        return
      }

      updateItem(item.id, { status: 'sent', sending: false })
      if (db) {
        await updateDoc(doc(db, 'users', u.uid), { usageSend: increment(1) })
        onConfigUpdate(c ? { ...c, usageSend: c.usageSend + 1 } : c)
      }
    } catch (e) {
      updateItem(item.id, { status: 'error', error: e instanceof Error ? e.message : 'Send failed', sending: false })
    }
  }, [updateItem, onConfigUpdate])

  const analyzeAllPending = useCallback(() => {
    setItems((prev) => {
      const pending = prev.filter((i) => i.status === 'pending')
      if (pending.length === 0) return prev

      const limits = planLimits[configRef.current?.plan || 'free']
      const remaining = limits.analyze - (configRef.current?.usageAnalyze || 0)
      if (remaining <= 0) { setUpgradeOpen(true); return prev }

      setBulkRunning(true)
      setBulkProgress({ done: 0, total: pending.length })

      Promise.allSettled(pending.map(async (item) => {
        await analyzeSingle(item)
        setBulkProgress((p) => ({ ...p, done: p.done + 1 }))
      })).finally(() => {
        setBulkRunning(false)
      })

      return prev
    })
  }, [analyzeSingle])

  const sendAllDone = useCallback(() => {
    setItems((prev) => {
      const done = prev.filter((i) => i.status === 'done' && i.selected)
      if (done.length === 0) return prev
      setSendingBulk(true)
      Promise.allSettled(done.map((item) => sendSingleItem(item))).finally(() => {
        setSendingBulk(false)
      })
      return prev
    })
  }, [sendSingleItem])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)))
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, expanded: !i.expanded } : i)))
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
  }, [])

  return (
    <ProcessingContext.Provider value={{
      config, items, bulkRunning, bulkProgress, sendingBulk, upgradeOpen,
      addFiles, removeItem, toggleSelect, toggleExpanded, updateItem,
      analyzeAllPending, analyzeSingle, sendAllDone, sendSingleItem, clearAll,
      setUpgradeOpen,
    }}>
      {children}
    </ProcessingContext.Provider>
  )
}
