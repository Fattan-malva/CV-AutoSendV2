'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { ArrowRight, FileText, Upload, X, WarningCircle, PaperPlaneTilt } from 'phosphor-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { useProcessing } from '@/lib/processing-context'
import Skeleton from '@/components/ui/Skeleton'
import type { AnalysisResult } from '@/types'

function GrowableTextarea({ value, onChange, className, placeholder }: {
  value: string
  onChange: (v: string) => void
  className?: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.max(el.scrollHeight, 60) + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder}
      style={{ minHeight: 60, resize: 'vertical' }}
    />
  )
}

function UsageCircle({ label, used, total, onUpgrade }: { label: string; used: number; total: number; onUpgrade?: () => void }) {
  const { t } = useI18n()
  const isUnlimited = total === Infinity
  const percentage = isUnlimited ? 100 : Math.min((used / total) * 100, 100)
  const isNearLimit = !isUnlimited && used >= total * 0.8 && used < total
  const isFull = !isUnlimited && used >= total
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getStrokeColor = () => {
    if (isUnlimited) return '#8A9A8A'
    if (isFull) return '#ef4444'
    if (isNearLimit) return '#fbbf24'
    return '#8A9A8A'
  }

  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onUpgrade}>
      <div className="relative">
        <svg width="80" height="80" className="transform -rotate-90">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-lg font-semibold text-foreground">
            {isUnlimited ? '∞' : Math.max(0, total - used)}
          </span>
          <span className="text-[9px] text-muted -mt-1 uppercase tracking-wider">{t.dashboard.usageLeft}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-[10px] text-muted uppercase tracking-wider">{label}</span>
        <div className="text-xs text-foreground">
          {isUnlimited ? t.dashboard.usageUsed.replace('{count}', String(used)) : `${used} ${t.dashboard.of} ${total}`}
        </div>
      </div>
      {isNearLimit && !isUnlimited && !isFull && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      )}
    </div>
  )
}

function FileStatusBadge({ status, isAnalyzing, isSending }: { status: string; isAnalyzing?: boolean; isSending?: boolean }) {
  const { t } = useI18n()

  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <span className="text-[10px] text-accent uppercase tracking-wider">{t.dashboard.fileStatus.analyzing}</span>
      </div>
    )
  }

  if (isSending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <span className="text-[10px] text-accent uppercase tracking-wider">{t.dashboard.sending}</span>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: t.dashboard.fileStatus.pending, color: 'text-muted', bg: 'bg-subtle' },
    done: { label: t.dashboard.fileStatus.done, color: 'text-accent', bg: 'bg-accent/10' },
    sent: { label: t.dashboard.fileStatus.sent, color: 'text-accent', bg: 'bg-accent/10' },
    error: { label: t.dashboard.fileStatus.error, color: 'text-red-400', bg: 'bg-red-500/10' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  )
}

export default function DashboardClient() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [isDragging, setIsDragging] = useState(false)
  const {
    config, items, bulkRunning, bulkProgress, sendingBulk,
    addFiles, removeItem, toggleSelect, toggleExpanded, updateItem,
    analyzeAllPending, analyzeSingle, sendAllDone, sendSingleItem, clearAll,
    upgradeOpen, setUpgradeOpen,
  } = useProcessing()

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith('image/') || f.type === 'application/pdf'
    )
    if (files.length > 0) addFiles(files)
  }, [addFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) addFiles(files)
    e.target.value = ''
  }, [addFiles])

  if (!config) {
    return (
      <div className="space-y-8">
        {/* Usage + Upload card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-1.5 rounded-[2rem] bg-border/30">
            <div className="rounded-[calc(2rem-0.375rem)] bg-card p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
              <div className="flex justify-center gap-12">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="w-20 h-20 rounded-full" />
              </div>
            </div>
          </div>

          <div className="p-1.5 rounded-[2rem] bg-border/30">
            <div className="rounded-[calc(2rem-0.375rem)] bg-card p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2 w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* File list card skeletons */}
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-1.5 rounded-[2rem] bg-border/30">
              <div className="rounded-[calc(2rem-0.375rem)] bg-card overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3 px-5 py-4">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-5 w-16 rounded-full ml-auto" />
                  <Skeleton className="w-4 h-4 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length
  const doneCount = items.filter((i) => i.status === 'done' && i.selected).length
  const usageAnalyze = config?.usageAnalyze || 0
  const usageSend = config?.usageSend || 0
  const planLimitsMap: Record<string, { analyze: number; send: number }> = {
    free: { analyze: 3, send: 3 },
    basic: { analyze: 20, send: 20 },
    starter: { analyze: 80, send: 80 },
    pro: { analyze: Infinity, send: Infinity },
  }
  const limits = planLimitsMap[config.plan] || planLimitsMap.free
  const isPro = config.plan === 'pro'
  const analyzeLimit = limits.analyze
  const sendLimit = limits.send

  const inputClass = "w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-300"

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-1.5 rounded-[2rem] bg-border/30">
          <div className="rounded-[calc(2rem-0.375rem)] bg-card p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-accent text-sm">∞</span>
                </div>
                <div>
                  <h2 className="text-sm text-foreground font-medium">{t.dashboard.usageTitle}</h2>
                  <p className="text-[10px] text-muted mt-0.5">
                    {isPro ? t.dashboard.unlimitedAccess : t.dashboard.analyzesRemaining.replace('{count}', String(analyzeLimit - usageAnalyze))}
                  </p>
                </div>
              </div>
              {!isPro && (
                <button
                  onClick={() => setUpgradeOpen(true)}
                  className="group flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-all duration-300"
                >
                  {t.dashboard.upgrade}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              )}
            </div>

            <div className="flex justify-center gap-12">
              <UsageCircle label={t.dashboard.usageAnalyze} used={usageAnalyze} total={analyzeLimit}
                onUpgrade={() => !isPro && setUpgradeOpen(true)} />
              <UsageCircle label={t.dashboard.usageSend} used={usageSend} total={sendLimit}
                onUpgrade={() => !isPro && setUpgradeOpen(true)} />
            </div>

            {!isPro && (usageAnalyze >= analyzeLimit || usageSend >= sendLimit) && (
              <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-400">{t.dashboard.limitReached}</p>
                    <p className="text-[10px] text-muted mt-0.5">{t.dashboard.upgradeForUnlimited}</p>
                  </div>
                  <button onClick={() => setUpgradeOpen(true)}
                    className="group flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 text-background text-xs font-medium hover:opacity-90 transition-all duration-300 active:scale-[0.98]">
                    {t.dashboard.upgrade}
                    <ArrowRight size={12} weight="bold" className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`
            p-1.5 rounded-[2rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isDragging
              ? 'bg-accent/30 scale-[0.99]'
              : 'bg-border/30 hover:bg-border/50'
            }
          `}
        >
          <div className={`rounded-[calc(2rem-0.375rem)] bg-card p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full flex items-center justify-center cursor-pointer`}>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 ${isDragging ? 'border-accent text-accent' : 'border-border text-muted'}`}>
                <Upload size={24} />
              </div>
              <div>
                <p className="text-sm text-foreground font-medium">
                  {isDragging ? t.dashboard.dropzoneActive : t.dashboard.dropzone}
                </p>
                <p className="text-[11px] text-muted mt-1">{t.dashboard.dropzoneMulti}</p>
              </div>
            </div>
            <input id="file-input" type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleFileInput} />
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <button
            onClick={analyzeAllPending}
            disabled={bulkRunning || pendingCount === 0}
            className="group flex items-center gap-2 bg-accent text-background rounded-full px-5 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            {bulkRunning ? (
              <><Skeleton className="w-4 h-4 rounded-full" /><span>{t.dashboard.analyzeProgress.replace('{done}', String(bulkProgress.done)).replace('{total}', String(bulkProgress.total))}</span></>
            ) : (
              <><span>{t.dashboard.analyzeFiles.replace('{count}', String(pendingCount))}</span><ArrowRight size={16} weight="bold" /></>
            )}
          </button>
          <button
            onClick={sendAllDone}
            disabled={sendingBulk || doneCount === 0}
            className="group flex items-center gap-2 border border-border text-foreground rounded-full px-5 py-3 text-sm font-medium hover:bg-subtle disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            {sendingBulk ? (
              <><Skeleton className="w-4 h-4 rounded-full" /><span>{t.dashboard.sending}</span></>
            ) : (
              <><PaperPlaneTilt size={16} /><span>{t.dashboard.sendSelected.replace('{count}', String(doneCount))}</span></>
            )}
          </button>
          <button onClick={clearAll} className="text-muted hover:text-foreground text-xs transition-colors duration-300">
            {t.dashboard.clearAll}
          </button>
          <span className="text-xs text-muted ml-auto">
            {t.dashboard.fileCount.replace('{count}', String(items.length))}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-8 text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-subtle flex items-center justify-center mb-4">
            <FileText size={28} className="text-muted" />
          </div>
          <p className="text-sm text-muted">{t.dashboard.noFiles}</p>
          <p className="text-[11px] text-muted/70 mt-1">{t.dashboard.uploadPrompt}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-1.5 rounded-[2rem] bg-border/30">
              <div className="rounded-[calc(2rem-0.375rem)] bg-card overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-subtle/40 transition-colors duration-300"
                  onClick={() => toggleExpanded(item.id)}>
                  <input type="checkbox" checked={item.selected}
                    onChange={() => toggleSelect(item.id)} onClick={(e) => e.stopPropagation()}
                    className="rounded border-border bg-surface accent-[var(--accent)] w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground truncate">{item.file.name}</span>
                      <FileStatusBadge status={item.status} isAnalyzing={item.status === 'analyzing'} isSending={item.sending} />
                    </div>
                    {item.error && <p className="text-[10px] text-red-400 mt-1">{item.error}</p>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}
                    className="text-muted hover:text-red-400 transition-colors duration-300 p-1">
                    <X size={16} />
                  </button>
                </div>

                {item.expanded && item.status === 'done' && (
                  <div className="border-t border-border p-5 space-y-4 bg-subtle/30">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.subjek}</label>
                        <GrowableTextarea value={item.editable.subjek}
                          onChange={(v) => updateItem(item.id, { editable: { ...item.editable, subjek: v } })}
                          className={inputClass} placeholder={t.dashboard.placeholderSubject} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.perusahaan}</label>
                          <input value={item.editable.nama_perusahaan}
                            onChange={(e) => updateItem(item.id, { editable: { ...item.editable, nama_perusahaan: e.target.value } })}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.posisi}</label>
                          <input value={item.editable.posisi}
                            onChange={(e) => updateItem(item.id, { editable: { ...item.editable, posisi: e.target.value } })}
                            className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.email}</label>
                        <input value={item.editable.email}
                          onChange={(e) => updateItem(item.id, { editable: { ...item.editable, email: e.target.value } })}
                          className={inputClass} type="email" placeholder={t.dashboard.placeholderEmail} />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.intro}</label>
                        <GrowableTextarea value={item.editable.intro}
                          onChange={(v) => updateItem(item.id, { editable: { ...item.editable, intro: v } })}
                          className={inputClass} placeholder={t.dashboard.placeholderIntro} />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.alasan}</label>
                        <GrowableTextarea value={item.editable.alasan}
                          onChange={(v) => updateItem(item.id, { editable: { ...item.editable, alasan: v } })}
                          className={inputClass} placeholder={t.dashboard.placeholderAlasan} />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">{t.dashboard.penutup}</label>
                        <GrowableTextarea value={item.editable.penutup}
                          onChange={(v) => updateItem(item.id, { editable: { ...item.editable, penutup: v } })}
                          className={inputClass} placeholder={t.dashboard.placeholderPenutup} />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-end">
                      <button onClick={() => sendSingleItem(item)}
                        disabled={item.sending || !config?.smtpPass || !config?.cvPath || !item.editable.email}
                        className="group flex items-center gap-2 text-sm bg-accent text-background rounded-full px-5 py-2.5 font-medium hover:opacity-90 disabled:opacity-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                      >
                        {item.sending ? <><Skeleton className="w-4 h-4 rounded-full" /><span>{t.dashboard.sending}</span></>
                          : <><span>{t.dashboard.sendEmail}</span><PaperPlaneTilt size={16} weight="bold" /></>}
                      </button>
                    </div>
                  </div>
                )}

                {item.expanded && item.status === 'error' && (
                  <div className="border-t border-border p-5 space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <WarningCircle size={20} />
                      <p className="text-sm">{item.error || t.dashboard.analysisFailed}</p>
                    </div>
                    <button onClick={() => analyzeSingle(item)}
                      className="text-sm bg-subtle text-foreground rounded-full px-5 py-2.5 font-medium hover:bg-border transition-colors duration-300 border border-border"
                    >
                      {t.dashboard.retryAnalysis}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
