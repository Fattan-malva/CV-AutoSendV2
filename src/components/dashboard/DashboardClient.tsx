'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { ArrowRight, FileText, Upload, X, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { useProcessing } from '@/lib/processing-context'
import WindowFrame from '@/components/ui/WindowFrame'
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
    if (isUnlimited) return '#4ade80'
    if (isFull) return '#ef4444'
    if (isNearLimit) return '#fbbf24'
    return '#4ade80'
  }

  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onUpgrade}>
      <div className="relative">
        <svg width="80" height="80" className="transform -rotate-90">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="#27272a" strokeWidth="6" />
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
          <span className="font-mono text-lg font-bold text-zinc-100">
            {isUnlimited ? '\u221e' : Math.max(0, total - used)}
          </span>
          <span className="font-mono text-[9px] text-zinc-500 -mt-1">{t.dashboard.usageLeft}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
        <div className="font-mono text-xs text-zinc-300">
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
        <span className="font-mono text-[10px] text-amber-400 uppercase">{t.dashboard.fileStatus.analyzing}</span>
      </div>
    )
  }

  if (isSending) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded-full" />
        <span className="font-mono text-[10px] text-amber-400 uppercase">{t.dashboard.sending}</span>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: t.dashboard.fileStatus.pending, color: 'text-zinc-500', bg: 'bg-zinc-800/50' },
    done: { label: t.dashboard.fileStatus.done, color: 'text-green-400', bg: 'bg-green-400/10' },
    sent: { label: t.dashboard.fileStatus.sent, color: 'text-green-400', bg: 'bg-green-400/10' },
    error: { label: t.dashboard.fileStatus.error, color: 'text-red-400', bg: 'bg-red-500/10' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
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
      <div className="flex items-center justify-center py-20">
        <WindowFrame title="~/loading" accent="green" className="max-w-md mx-4 p-6 text-center">
          <Skeleton className="w-8 h-8 rounded-full mx-auto" />
        </WindowFrame>
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

  return (
    <>
      {/* Usage + Upload side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage Stats */}
        <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                <span className="text-green-400 font-mono text-xs">$</span>
              </div>
              <div>
                <h2 className="font-mono text-sm text-zinc-300">{t.dashboard.usageTitle}</h2>
                <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
                  {isPro ? t.dashboard.unlimitedAccess : t.dashboard.analyzesRemaining.replace('{count}', String(analyzeLimit - usageAnalyze))}
                </p>
              </div>
            </div>
            {!isPro && (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="font-mono text-xs bg-green-400/10 hover:bg-green-400/20 text-green-400 px-3 py-1.5 rounded-lg transition-colors border border-green-400/20"
              >
                {t.dashboard.upgrade} <ArrowRight className="w-3 h-3 inline" />
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
            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-amber-400">{t.dashboard.limitReached}</p>
                  <p className="font-mono text-[10px] text-zinc-500 mt-0.5">{t.dashboard.upgradeForUnlimited}</p>
                </div>
                <button onClick={() => setUpgradeOpen(true)}
                  className="font-mono text-xs bg-amber-500 text-zinc-950 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-400 transition-colors">
                  {t.dashboard.upgrade}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 cursor-pointer
            flex items-center justify-center h-full
            transition-all duration-200
            ${isDragging
              ? 'border-green-400 bg-green-400/5 scale-[0.99]'
              : 'border-zinc-700 hover:border-green-400/50 bg-zinc-900/30'
            }
          `}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <Upload className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <p className="font-mono text-sm text-zinc-300">
                {isDragging ? t.dashboard.dropzoneActive : t.dashboard.dropzone}
              </p>
              <p className="font-mono text-[11px] text-zinc-600 mt-1">{t.dashboard.dropzoneMulti}</p>
            </div>
            <div className="font-mono text-[10px] text-zinc-600 flex items-center gap-2">
              <span className="text-green-400">$</span>
              <span>{t.dashboard.uploadCmd}</span>
            </div>
          </div>
          <input id="file-input" type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleFileInput} />
        </div>
      </div>

      {/* Bulk Actions */}
      {items.length > 0 && (
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          <button
            onClick={analyzeAllPending}
            disabled={bulkRunning || pendingCount === 0}
            className="flex items-center gap-2 bg-green-400 text-zinc-950 rounded-xl px-4 py-2.5 font-mono text-sm font-medium hover:bg-green-300 disabled:opacity-40 transition-all"
          >
            {bulkRunning ? (
              <><Skeleton className="w-4 h-4 rounded-full" /><span>{t.dashboard.analyzeProgress.replace('{done}', String(bulkProgress.done)).replace('{total}', String(bulkProgress.total))}</span></>
            ) : (
              <>{t.dashboard.analyzeFiles.replace('{count}', String(pendingCount))}</>
            )}
          </button>
          <button
            onClick={sendAllDone}
            disabled={sendingBulk || doneCount === 0}
            className="flex items-center gap-2 border border-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 font-mono text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 transition-all"
          >
            {sendingBulk ? (
              <><Skeleton className="w-4 h-4 rounded-full" /><span>{t.dashboard.sending}</span></>
            ) : (
              <>{t.dashboard.sendSelected.replace('{count}', String(doneCount))}</>
            )}
          </button>
          <button onClick={clearAll} className="text-zinc-600 hover:text-zinc-400 font-mono text-xs transition-colors">
            {t.dashboard.clearAll}
          </button>
          <span className="font-mono text-xs text-zinc-600 ml-auto">
            {t.dashboard.fileCount.replace('{count}', String(items.length))}
          </span>
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="mt-8 text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="font-mono text-sm text-zinc-500">{t.dashboard.noFiles}</p>
          <p className="font-mono text-[11px] text-zinc-600 mt-1">{t.dashboard.uploadPrompt}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <WindowFrame key={item.id} title={`~/items/${item.file.name}`}
              accent={item.status === 'error' ? 'zinc' : 'green'} className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                onClick={() => toggleExpanded(item.id)}>
                <input type="checkbox" checked={item.selected}
                  onChange={() => toggleSelect(item.id)} onClick={(e) => e.stopPropagation()}
                  className="rounded border-zinc-600 bg-zinc-800 accent-green-400 w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-300 truncate">{item.file.name}</span>
                    <FileStatusBadge status={item.status} isAnalyzing={item.status === 'analyzing'} isSending={item.sending} />
                  </div>
                  {item.error && <p className="font-mono text-[10px] text-red-400 mt-1">{item.error}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeItem(item.id) }}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded Content */}
              {item.expanded && item.status === 'done' && (
                <div className="border-t border-zinc-800 p-4 space-y-4 bg-zinc-900/30">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 pb-2 border-b border-zinc-800">
                    <span className="text-green-400">$</span>
                    <span>{t.dashboard.editCmd}</span>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.subjek}</label>
                      <GrowableTextarea value={item.editable.subjek}
                        onChange={(v) => updateItem(item.id, { editable: { ...item.editable, subjek: v } })}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
                        placeholder={t.dashboard.placeholderSubject} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.perusahaan}</label>
                        <input value={item.editable.nama_perusahaan}
                          onChange={(e) => updateItem(item.id, { editable: { ...item.editable, nama_perusahaan: e.target.value } })}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all" />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.posisi}</label>
                        <input value={item.editable.posisi}
                          onChange={(e) => updateItem(item.id, { editable: { ...item.editable, posisi: e.target.value } })}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.email}</label>
                      <input value={item.editable.email}
                        onChange={(e) => updateItem(item.id, { editable: { ...item.editable, email: e.target.value } })}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
                        type="email" placeholder={t.dashboard.placeholderEmail} />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.intro}</label>
                      <GrowableTextarea value={item.editable.intro}
                        onChange={(v) => updateItem(item.id, { editable: { ...item.editable, intro: v } })}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
                        placeholder={t.dashboard.placeholderIntro} />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.alasan}</label>
                      <GrowableTextarea value={item.editable.alasan}
                        onChange={(v) => updateItem(item.id, { editable: { ...item.editable, alasan: v } })}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
                        placeholder={t.dashboard.placeholderAlasan} />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-zinc-500 block mb-1.5">{t.dashboard.penutup}</label>
                      <GrowableTextarea value={item.editable.penutup}
                        onChange={(v) => updateItem(item.id, { editable: { ...item.editable, penutup: v } })}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
                        placeholder={t.dashboard.placeholderPenutup} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-zinc-800 flex justify-end">
                    <button onClick={() => sendSingleItem(item)}
                      disabled={item.sending || !config?.smtpPass || !config?.cvPath || !item.editable.email}
                      className="flex items-center gap-2 font-mono text-xs bg-green-400 text-zinc-950 rounded-lg px-4 py-2 font-medium hover:bg-green-300 disabled:opacity-40 transition-all">
                      {item.sending ? <><Skeleton className="w-4 h-4 rounded-full" /><span>{t.dashboard.sending}</span></>
                        : <><span>{t.dashboard.sendEmail}</span></>}
                    </button>
                  </div>
                </div>
              )}

              {item.expanded && item.status === 'error' && (
                <div className="border-t border-zinc-800 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-mono text-xs">{item.error || t.dashboard.analysisFailed}</p>
                  </div>
                  <button onClick={() => analyzeSingle(item)}
                    className="font-mono text-xs bg-zinc-800 text-zinc-300 rounded-lg px-4 py-2 font-medium hover:bg-zinc-700 transition-colors">
                    {t.dashboard.retryAnalysis}
                  </button>
                </div>
              )}
            </WindowFrame>
          ))}
        </div>
      )}
    </>
  )
}
