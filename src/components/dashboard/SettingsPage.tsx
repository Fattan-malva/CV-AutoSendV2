'use client'

import { useState, useRef, useEffect } from 'react'
import { Gear, ArrowSquareOut, Upload, FileText, CheckCircle, XCircle, Translate } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import Skeleton from '@/components/ui/Skeleton'
import type { UserConfig } from '@/types'

interface SettingsPageProps {
  config: UserConfig
  onConfigUpdate: (c: UserConfig) => void
}

export default function SettingsPage({ config, onConfigUpdate }: SettingsPageProps) {
  const { user } = useAuth()
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)

  const [smtpHost, setSmtpHost] = useState(config.smtpHost || 'smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(String(config.smtpPort || 587))
  const [smtpUser, setSmtpUser] = useState(config.smtpUser || user?.email || '')
  const [smtpPass, setSmtpPass] = useState('')
  const [senderName, setSenderName] = useState(config.senderName || user?.displayName || '')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvPreview, setCvPreview] = useState(config.cvPath || '')
  const [smtpConfigured, setSmtpConfigured] = useState(!!config.smtpPass)
  const [analyzeLanguage, setAnalyzeLanguage] = useState<'id' | 'en'>(config.analyzeLanguage || 'id')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')

  useEffect(() => {
    setSmtpHost(config.smtpHost || 'smtp.gmail.com')
    setSmtpPort(String(config.smtpPort || 587))
    setSmtpUser(config.smtpUser || user?.email || '')
    setSmtpPass('')
    setSmtpConfigured(!!config.smtpPass)
    setSenderName(config.senderName || user?.displayName || '')
    setCvPreview(config.cvPath || '')
    setAnalyzeLanguage(config.analyzeLanguage || 'id')
  }, [config])

  const openCvPreview = async () => {
    if (!cvPreview) return
    setPreviewLoading(true)
    try {
      const res = await fetch(cvPreview)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      window.open(cvPreview, '_blank')
    } finally {
      setPreviewLoading(false)
    }
  }

  const testSmtp = async () => {
    if (!user || !smtpPass) return false
    setTesting(true)
    setTestMsg('')
    setSaveMsg('')
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/send-email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          smtpHost, smtpPort: Number(smtpPort), smtpUser, smtpPass,
          senderName: senderName || user.displayName || smtpUser.split('@')[0] || '',
          to: user.email,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setTestMsg(data.error || 'Test failed'); return false }
      setTestMsg('Test email sent! Check your inbox.')
      return true
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : 'Test failed')
      return false
    } finally { setTesting(false) }
  }

  const handleSave = async () => {
    if (!user) { setSaveMsg('User tidak ditemukan'); return }
    if (smtpPass) {
      const ok = await testSmtp()
      if (!ok) { setSaveMsg('App password tidak valid. Periksa kembali.'); return }
    }
    setSaving(true)
    setSaveMsg('')
    try {
      const token = await user.getIdToken()
      let cvPath = config.cvPath
      if (cvFile) {
        const toBase64 = (f: File): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(f)
          })
        const fileBase64 = await toBase64(cvFile)
        const uploadRes = await fetch('/api/upload-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fileName: cvFile.name, fileBase64, mimeType: cvFile.type }),
        })
        if (!uploadRes.ok) { const err = await uploadRes.json(); throw new Error(err.error || 'Gagal upload CV') }
        const data = await uploadRes.json()
        cvPath = data.url
        setCvPreview(cvPath)
      }
      const saveBody: Record<string, unknown> = { smtpHost, smtpPort: Number(smtpPort), smtpUser, senderName: senderName || user?.displayName || (smtpUser ? smtpUser.split('@')[0] : '') || '', cvPath, analyzeLanguage }
      if (smtpPass) saveBody.smtpPass = smtpPass
      const saveRes = await fetch('/api/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(saveBody),
      })
      if (!saveRes.ok) { const err = await saveRes.json(); throw new Error(err.error || 'Gagal menyimpan') }
      setSmtpConfigured(true)
      setSmtpPass('')
      setSaveMsg('Disimpan!')
      onConfigUpdate({ ...config, smtpHost, smtpPort: Number(smtpPort), smtpUser, smtpPass: smtpPass ? 'encrypted' : config.smtpPass, senderName: senderName || user?.displayName || (smtpUser ? smtpUser.split('@')[0] : '') || '', cvPath, analyzeLanguage })
      setTimeout(() => setSaveMsg(''), 2000)
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const inputClass = "w-full mt-1 bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-300"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Gear size={18} className="text-accent" weight="duotone" />
        </div>
        <div>
          <h2 className="text-sm text-foreground font-medium">Settings</h2>
          <p className="text-[10px] text-muted mt-0.5">Configure your SMTP and CV</p>
        </div>
      </div>

      {(!config.smtpPass || !config.cvPath) && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <p className="text-xs text-amber-400">{t.signup.missingConfig}</p>
          <div className="mt-1 space-y-0.5">
            {!config.smtpPass && <p className="text-[10px] text-muted">{t.signup.missingAppPass}</p>}
            {!config.cvPath && <p className="text-[10px] text-muted">{t.signup.missingCv}</p>}
          </div>
        </div>
      )}

      <div className="p-1.5 rounded-[2rem] bg-border/30">
        <div className="rounded-[calc(2rem-0.375rem)] bg-card p-7 space-y-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted">{t.signup.smtpHost}</label>
              <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted">{t.signup.smtpPort}</label>
              <input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted">{t.signup.smtpUser}</label>
            <input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} type="email" className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted">{t.signup.smtpPass}</label>
            <div className="relative mt-1">
              <input value={smtpPass} onChange={(e) => { setSmtpPass(e.target.value); if (e.target.value) setSmtpConfigured(false) }}
                className={`${inputClass} pr-10`}
                type="password" placeholder={smtpConfigured ? '••••••••' : 'xxxx xxxx xxxx xxxx'} />
              <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors" title={t.signup.smtpPassGuide}>
                <ArrowSquareOut size={16} />
              </a>
            </div>
            <details className="mt-2 group">
              <summary className="text-[10px] text-muted cursor-pointer hover:text-foreground transition-colors">{t.signup.smtpPassGuide}</summary>
              <div className="mt-2 p-3 bg-subtle border border-border rounded-xl space-y-1">
                <p className="text-[10px] text-muted">{t.signup.smtpPassGuideStep1}</p>
                <p className="text-[10px] text-muted">{t.signup.smtpPassGuideStep2}</p>
                <p className="text-[10px] text-muted">{t.signup.smtpPassGuideStep3}</p>
                <p className="text-[10px] text-muted">{t.signup.smtpPassGuideStep4}</p>
                <p className="text-[10px] text-muted">{t.signup.smtpPassGuideStep5}</p>
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-accent hover:opacity-80 underline underline-offset-2 mt-1">
                  myaccount.google.com/apppasswords
                </a>
              </div>
            </details>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted">{t.signup.senderName}</label>
            <input value={senderName} onChange={(e) => setSenderName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Translate size={12} />
              {t.signup.analyzeLanguage}
            </label>
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={() => setAnalyzeLanguage('id')}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${analyzeLanguage === 'id' ? 'bg-accent text-background' : 'bg-surface border border-border text-muted hover:text-foreground'}`}
              >
                Indonesia
              </button>
              <button
                onClick={() => setAnalyzeLanguage('en')}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${analyzeLanguage === 'en' ? 'bg-accent text-background' : 'bg-surface border border-border text-muted hover:text-foreground'}`}
              >
                English
              </button>
            </div>
            <p className="text-[10px] text-muted mt-1.5">{t.signup.analyzeLanguageDesc}</p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted">{t.signup.uploadCv}</label>
            <label className="mt-1 flex items-center gap-3 border border-dashed border-border rounded-xl px-4 py-3.5 cursor-pointer hover:border-accent/50 hover:bg-subtle/40 transition-all duration-300">
              <Upload size={18} className="text-muted shrink-0" />
              <span className="text-sm text-muted truncate">{cvFile ? cvFile.name : cvPreview ? 'Update CV' : 'Upload CV (PDF)'}</span>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          {cvPreview && (
            <button onClick={openCvPreview} disabled={previewLoading}
              className="flex items-center gap-2 text-xs text-accent hover:opacity-80 disabled:opacity-40 transition-all duration-300"
            >
              {previewLoading ? (
                <Skeleton className="w-4 h-4 rounded" />
              ) : (
                <FileText size={16} />
              )}
              Preview CV
            </button>
          )}

          {smtpPass && (
            <button onClick={testSmtp} disabled={testing}
              className="w-full border border-border text-foreground rounded-full px-4 py-3 text-sm font-medium hover:bg-subtle disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              {testing ? 'Testing...' : t.signup.testEmail}
            </button>
          )}

          {testMsg && <p className={`text-xs flex items-center gap-1.5 ${testMsg.includes('sent') ? 'text-accent' : 'text-red-400'}`}>
            {testMsg.includes('sent') ? <CheckCircle size={14} weight="fill" /> : <XCircle size={14} />}
            {testMsg}
          </p>}
          {saveMsg && <p className={`text-xs flex items-center gap-1.5 ${saveMsg === 'Disimpan!' ? 'text-accent' : 'text-red-400'}`}>
            {saveMsg === 'Disimpan!' ? <CheckCircle size={14} weight="fill" /> : <XCircle size={14} />}
            {saveMsg}
          </p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-accent text-background rounded-full px-4 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            {saving ? t.signup.saving : t.signup.save}
          </button>
        </div>
      </div>
    </div>
  )
}
