'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  XCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n-context'
import { getPlanLabel, getPlanLimit, isUnlimited } from '@/lib/plans'
import { useProcessing } from '@/lib/processing-context'
import { useTheme, type ThemeMode } from '@/lib/theme-context'
import { cn, getDisplayNameInitials } from '@/lib/utils'
import type { UserConfig } from '@/types'

interface SettingsPageProps {
  config: UserConfig
  onConfigUpdate: (config: UserConfig) => void
}

type SectionId = 'profile' | 'email' | 'cv' | 'appearance'

const sections: {
  id: SectionId
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'profile', label: 'Profile', description: 'Account & plan', icon: User },
  { id: 'email', label: 'Email & SMTP', description: 'Sending identity', icon: Mail },
  { id: 'cv', label: 'CV file', description: 'Attachment used', icon: FileText },
  { id: 'appearance', label: 'Appearance', description: 'Theme & language', icon: Palette },
]

const themeOptions: { value: ThemeMode; label: string; preview: string }[] = [
  { value: 'light', label: 'Light', preview: 'bg-[#f7f7f5]' },
  { value: 'dark', label: 'Dark', preview: 'bg-[#0a0a0c]' },
  { value: 'system', label: 'System', preview: 'bg-gradient-to-br from-[#f7f7f5] to-[#0a0a0c]' },
]

function SettingsSaveBar({
  saving,
  onSave,
  label = 'Save changes',
}: {
  saving: boolean
  onSave: () => void
  label?: string
}) {
  return (
    <div className='flex justify-end border-t pt-4'>
      <Button onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className='size-4 animate-spin' /> : <Save className='size-4' />}
        {saving ? 'Saving…' : label}
      </Button>
    </div>
  )
}

export default function SettingsPage({ config, onConfigUpdate }: SettingsPageProps) {
  const { user } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const { themeMode, setTheme } = useTheme()
  const { setUpgradeOpen } = useProcessing()

  const [active, setActive] = useState<SectionId>('profile')
  const [smtpHost, setSmtpHost] = useState(config.smtpHost || 'smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(String(config.smtpPort || 587))
  const [smtpUser, setSmtpUser] = useState(config.smtpUser || user?.email || '')
  const [smtpPass, setSmtpPass] = useState('')
  const [senderName, setSenderName] = useState(config.senderName || user?.displayName || '')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvPreview, setCvPreview] = useState(config.cvPath || '')
  const [smtpConfigured, setSmtpConfigured] = useState(Boolean(config.smtpPass))
  const [analyzeLanguage, setAnalyzeLanguage] = useState<'id' | 'en'>(
    config.analyzeLanguage || 'id'
  )
  const [saving, setSaving] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')

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
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/send-email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass,
          senderName: senderName || user.displayName || smtpUser.split('@')[0] || '',
          to: user.email,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setTestMsg(data.error || 'Test failed')
        return false
      }
      setTestMsg('Test email sent! Check your inbox.')
      toast.success('Test email sent')
      return true
    } catch (error) {
      setTestMsg(error instanceof Error ? error.message : 'Test failed')
      return false
    } finally {
      setTesting(false)
    }
  }

  const persistConfig = async () => {
    if (!user) throw new Error('User not found')
    const providedPass = smtpPass
    if (providedPass) {
      const ok = await testSmtp()
      if (!ok) throw new Error('App password is not valid. Please check again.')
    }
    const token = await user.getIdToken()
    let cvPath = config.cvPath
    if (cvFile) {
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      const fileBase64 = await toBase64(cvFile)
      const uploadRes = await fetch('/api/upload-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: cvFile.name,
          fileBase64,
          mimeType: cvFile.type,
        }),
      })
      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || 'Failed to upload CV')
      }
      const data = await uploadRes.json()
      cvPath = data.url
      setCvPreview(cvPath)
    }

    const resolvedSenderName =
      senderName || user.displayName || (smtpUser ? smtpUser.split('@')[0] : '') || ''
    const saveBody: Record<string, unknown> = {
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      senderName: resolvedSenderName,
      cvPath,
      analyzeLanguage,
    }
    if (providedPass) saveBody.smtpPass = providedPass

    const saveRes = await fetch('/api/save-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(saveBody),
    })
    if (!saveRes.ok) {
      const err = await saveRes.json()
      throw new Error(err.error || 'Failed to save settings')
    }

    setSmtpConfigured(Boolean(providedPass || config.smtpPass))
    setSmtpPass('')
    setCvFile(null)
    onConfigUpdate({
      ...config,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPass: providedPass ? 'encrypted' : config.smtpPass,
      senderName: resolvedSenderName,
      cvPath,
      analyzeLanguage,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await persistConfig()
      toast.success('Settings saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const plan = config.plan
  const limit = getPlanLimit(plan)
  const unlimited = isUnlimited(plan)
  const analyzePercent = unlimited
    ? 100
    : Math.min(100, ((config.usageAnalyze || 0) / limit) * 100)
  const sendPercent = unlimited ? 100 : Math.min(100, ((config.usageSend || 0) / limit) * 100)
  const missingConfig = !config.smtpPass || !config.cvPath

  return (
    <div className='flex flex-col gap-4 md:gap-6'>
      <div>
        <h2 className='text-2xl font-semibold tracking-tight'>{t.dashboard.settings}</h2>
        <p className='text-sm text-muted-foreground'>
          Manage your sending identity, CV attachment, plan, and dashboard appearance.
        </p>
      </div>

      {missingConfig ? (
        <div className='flex flex-col gap-2 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 sm:flex-row sm:items-center'>
          <div className='flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400'>
            <ShieldCheck className='mt-0.5 size-4 shrink-0' />
            <div>
              <p className='font-medium'>Setup required before sending applications</p>
              <p className='text-xs text-amber-700/80 dark:text-amber-400/80'>
                {!config.smtpPass ? 'Email app password is missing. ' : ''}
                {!config.cvPath ? 'CV attachment is missing.' : ''}
              </p>
            </div>
          </div>
          <div className='ms-auto flex gap-2'>
            {!config.smtpPass ? (
              <Button size='sm' variant='outline' onClick={() => setActive('email')}>
                Set up email
              </Button>
            ) : null}
            {!config.cvPath ? (
              <Button size='sm' variant='outline' onClick={() => setActive('cv')}>
                Upload CV
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className='grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]'>
        <nav className='flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:h-fit lg:flex-col'>
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = active === section.id
            return (
              <button
                key={section.id}
                type='button'
                onClick={() => setActive(section.id)}
                className={cn(
                  'flex min-w-fit items-center gap-2.5 rounded-lg px-3 py-2.5 text-start transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className='size-4 shrink-0' />
                <span className='grid'>
                  <span className='text-sm font-medium'>{section.label}</span>
                  <span className='hidden text-[10px] text-muted-foreground lg:block'>
                    {section.description}
                  </span>
                </span>
              </button>
            )
          })}
        </nav>

        <div className='min-w-0 space-y-4'>
          {active === 'profile' ? (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Profile</CardTitle>
                <CardDescription>
                  Your Ceefy account details and current subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                  <Avatar className='size-16'>
                    <AvatarImage src={user?.photoURL || undefined} alt={senderName} />
                    <AvatarFallback className='text-lg'>
                      {getDisplayNameInitials(
                        user?.displayName || senderName || user?.email || 'U'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='truncate text-lg font-semibold'>
                        {user?.displayName || senderName || 'User'}
                      </p>
                      <Badge variant='secondary' className='uppercase'>
                        {getPlanLabel(plan)}
                      </Badge>
                    </div>
                    <p className='truncate text-sm text-muted-foreground'>{user?.email}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Member since{' '}
                      {user?.metadata?.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString('en', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='sender-name'>Display name</Label>
                    <Input
                      id='sender-name'
                      value={senderName}
                      onChange={(event) => setSenderName(event.target.value)}
                      placeholder='Your name'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Used as the sender name in outgoing emails.
                    </p>
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Email address</Label>
                    <Input value={user?.email || ''} disabled />
                    <p className='text-xs text-muted-foreground'>
                      Signed in with Firebase Authentication.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='space-y-4 rounded-xl border bg-muted/30 p-4'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <div className='flex size-9 items-center justify-center rounded-lg border bg-background'>
                        <Zap className='size-4 text-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>{getPlanLabel(plan)} plan</p>
                        <p className='text-xs text-muted-foreground'>
                          {unlimited
                            ? 'Unlimited analyses and sends'
                            : `${limit} analyses and ${limit} sends per month`}
                        </p>
                      </div>
                    </div>
                    {!unlimited ? (
                      <Button size='sm' onClick={() => setUpgradeOpen(true)}>
                        <Sparkles className='size-3.5' /> Upgrade
                      </Button>
                    ) : (
                      <Badge
                        variant='secondary'
                        className='gap-1 border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      >
                        <CheckCircle2 className='size-3' /> Active
                      </Badge>
                    )}
                  </div>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between text-xs'>
                        <span>AI analyses</span>
                        <span className='text-muted-foreground'>
                          {unlimited
                            ? `${config.usageAnalyze || 0} used`
                            : `${config.usageAnalyze || 0} / ${limit}`}
                        </span>
                      </div>
                      <Progress value={analyzePercent} />
                    </div>
                    <div className='space-y-1.5'>
                      <div className='flex justify-between text-xs'>
                        <span>Email sends</span>
                        <span className='text-muted-foreground'>
                          {unlimited
                            ? `${config.usageSend || 0} used`
                            : `${config.usageSend || 0} / ${limit}`}
                        </span>
                      </div>
                      <Progress value={sendPercent} />
                    </div>
                  </div>
                  <Button variant='outline' size='sm' asChild>
                    <Link href='/#pricing'>
                      Compare plans <ArrowUpRight className='size-3.5' />
                    </Link>
                  </Button>
                </div>

                <SettingsSaveBar saving={saving} onSave={() => void handleSave()} />
              </CardContent>
            </Card>
          ) : null}

          {active === 'email' ? (
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='text-base'>Email & SMTP</CardTitle>
                    <CardDescription>
                      Connect your mailbox so Ceefy can send applications for you.
                    </CardDescription>
                  </div>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'gap-1',
                      smtpConfigured
                        ? 'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {smtpConfigured ? (
                      <CheckCircle2 className='size-3' />
                    ) : (
                      <XCircle className='size-3' />
                    )}
                    {smtpConfigured ? 'Configured' : 'Not configured'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-5'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='smtp-host'>{t.signup.smtpHost}</Label>
                    <Input
                      id='smtp-host'
                      value={smtpHost}
                      onChange={(event) => setSmtpHost(event.target.value)}
                      placeholder='smtp.gmail.com'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='smtp-port'>{t.signup.smtpPort}</Label>
                    <Input
                      id='smtp-port'
                      value={smtpPort}
                      onChange={(event) => setSmtpPort(event.target.value)}
                      placeholder='587'
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='smtp-user'>{t.signup.smtpUser}</Label>
                  <Input
                    id='smtp-user'
                    type='email'
                    value={smtpUser}
                    onChange={(event) => setSmtpUser(event.target.value)}
                    placeholder='you@gmail.com'
                  />
                </div>

                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between gap-2'>
                    <Label htmlFor='smtp-pass'>{t.signup.smtpPass}</Label>
                    <Button variant='link' size='sm' className='h-auto gap-1 p-0 text-xs' asChild>
                      <a
                        href='https://myaccount.google.com/apppasswords'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Get app password <ExternalLink className='size-3' />
                      </a>
                    </Button>
                  </div>
                  <PasswordInput
                    id='smtp-pass'
                    value={smtpPass}
                    onChange={(event) => {
                      setSmtpPass(event.target.value)
                      if (event.target.value) setSmtpConfigured(false)
                    }}
                    placeholder={smtpConfigured ? '••••••••••••••••' : 'xxxx xxxx xxxx xxxx'}
                  />
                  <details className='group pt-1'>
                    <summary className='cursor-pointer list-none text-xs text-muted-foreground hover:text-foreground'>
                      {t.signup.smtpPassGuide}
                    </summary>
                    <div className='mt-2 space-y-1 rounded-lg border bg-muted/40 p-3'>
                      {[
                        t.signup.smtpPassGuideStep1,
                        t.signup.smtpPassGuideStep2,
                        t.signup.smtpPassGuideStep3,
                        t.signup.smtpPassGuideStep4,
                        t.signup.smtpPassGuideStep5,
                      ].map((step) => (
                        <p key={step} className='text-xs text-muted-foreground'>
                          {step}
                        </p>
                      ))}
                      <a
                        href='https://myaccount.google.com/apppasswords'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1 pt-1 text-xs text-primary underline underline-offset-2'
                      >
                        myaccount.google.com/apppasswords
                        <ExternalLink className='size-3' />
                      </a>
                    </div>
                  </details>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='sender-name-email'>{t.signup.senderName}</Label>
                  <Input
                    id='sender-name-email'
                    value={senderName}
                    onChange={(event) => setSenderName(event.target.value)}
                    placeholder='Your name'
                  />
                </div>

                <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3'>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>Test connection</p>
                    <p className='text-xs text-muted-foreground'>
                      Send a test email to your own inbox before saving.
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => void testSmtp()}
                    disabled={testing || !smtpPass}
                  >
                    {testing ? <Loader2 className='size-3.5 animate-spin' /> : <Mail className='size-3.5' />}
                    {testing ? 'Testing…' : t.signup.testEmail}
                  </Button>
                </div>

                {testMsg ? (
                  <p
                    className={cn(
                      'flex items-center gap-1.5 text-xs',
                      testMsg.includes('sent')
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-destructive'
                    )}
                  >
                    {testMsg.includes('sent') ? (
                      <CheckCircle2 className='size-3.5' />
                    ) : (
                      <XCircle className='size-3.5' />
                    )}
                    {testMsg}
                  </p>
                ) : null}

                <SettingsSaveBar
                  saving={saving}
                  onSave={() => void handleSave()}
                  label='Save email settings'
                />
              </CardContent>
            </Card>
          ) : null}

          {active === 'cv' ? (
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='text-base'>CV attachment</CardTitle>
                    <CardDescription>
                      This PDF is attached to every application email.
                    </CardDescription>
                  </div>
                  <Badge
                    variant='secondary'
                    className={cn(
                      'gap-1',
                      cvPreview
                        ? 'border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {cvPreview ? <CheckCircle2 className='size-3' /> : <XCircle className='size-3' />}
                    {cvPreview ? 'Uploaded' : 'Missing'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-5'>
                <label className='flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40'>
                  <div className='flex size-12 items-center justify-center rounded-full border bg-background'>
                    <Upload className='size-5' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>
                      {cvFile ? cvFile.name : cvPreview ? 'Replace your CV' : 'Upload your CV'}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>PDF only · max 10 MB</p>
                  </div>
                  <input
                    type='file'
                    accept='.pdf'
                    className='hidden'
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null
                      if (file && file.size > 10 * 1024 * 1024) {
                        toast.error('CV must be smaller than 10 MB')
                        event.target.value = ''
                        return
                      }
                      setCvFile(file)
                    }}
                  />
                </label>

                {cvPreview ? (
                  <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/30 p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='flex size-8 items-center justify-center rounded-lg bg-background'>
                        <FileText className='size-4 text-primary' />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>Current CV</p>
                        <p className='max-w-[260px] truncate text-xs text-muted-foreground'>
                          {cvPreview}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => void openCvPreview()}
                      disabled={previewLoading}
                    >
                      {previewLoading ? (
                        <Loader2 className='size-3.5 animate-spin' />
                      ) : (
                        <ExternalLink className='size-3.5' />
                      )}
                      Preview
                    </Button>
                  </div>
                ) : null}

                <div className='rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground'>
                  Tip: use the{' '}
                  <Link
                    href='/dashboard/cv-builder'
                    className='text-primary underline underline-offset-2'
                  >
                    CV Builder
                  </Link>{' '}
                  to create a new ATS-friendly CV, then upload the exported PDF here.
                </div>

                <SettingsSaveBar saving={saving} onSave={() => void handleSave()} label='Save CV' />
              </CardContent>
            </Card>
          ) : null}

          {active === 'appearance' ? (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Appearance</CardTitle>
                <CardDescription>
                  Choose how the dashboard looks and which language Ceefy uses.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <section className='space-y-3'>
                  <Label>Theme</Label>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          'rounded-xl border p-2 text-start transition-colors hover:bg-accent/40',
                          themeMode === option.value && 'border-primary ring-2 ring-primary/20'
                        )}
                      >
                        <div
                          className={cn(
                            'mb-2 flex h-20 items-end rounded-lg border p-2',
                            option.preview
                          )}
                        >
                          <div className='h-1.5 w-10 rounded-full bg-primary' />
                        </div>
                        <span className='text-xs font-medium'>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className='space-y-3'>
                  <Label>Interface language</Label>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {[
                      { value: 'id' as const, label: 'Bahasa Indonesia', hint: 'Indonesian' },
                      { value: 'en' as const, label: 'English', hint: 'English' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => setLocale(option.value)}
                        className={cn(
                          'flex items-center justify-between rounded-lg border px-4 py-3 text-start transition-colors hover:bg-accent/40',
                          locale === option.value && 'border-primary ring-2 ring-primary/20'
                        )}
                      >
                        <span>
                          <span className='block text-sm font-medium'>{option.label}</span>
                          <span className='text-xs text-muted-foreground'>{option.hint}</span>
                        </span>
                        {locale === option.value ? (
                          <CheckCircle2 className='size-4 text-primary' />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className='space-y-3'>
                  <Label>{t.signup.analyzeLanguage}</Label>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    {[
                      { value: 'id' as const, label: 'Bahasa Indonesia' },
                      { value: 'en' as const, label: 'English' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => setAnalyzeLanguage(option.value)}
                        className={cn(
                          'rounded-lg border px-4 py-3 text-start text-sm font-medium transition-colors hover:bg-accent/40',
                          analyzeLanguage === option.value &&
                            'border-primary ring-2 ring-primary/20'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className='text-xs text-muted-foreground'>{t.signup.analyzeLanguageDesc}</p>
                </section>

                <SettingsSaveBar
                  saving={saving}
                  onSave={() => void handleSave()}
                  label='Save preferences'
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
