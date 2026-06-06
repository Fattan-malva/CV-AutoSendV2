'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { decrypt } from '@/lib/crypto'
import type { AnalysisResult, UserConfig } from '@/types'
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
    if (!c.cvPath) {
      updateItem(item.id, { status: 'error', error: 'CV not uploaded. Please upload it in profile settings.', sending: false })
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
          email: item.editable.email, fileUrl: c.cvPath, fileName: 'CV.pdf',
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
