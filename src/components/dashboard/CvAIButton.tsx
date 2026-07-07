'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sparkle, Spinner, CheckCircle } from 'phosphor-react'

interface CvAIButtonProps {
  section: string
  language: 'id' | 'en'
  context: string
  onResult: (text: string) => void
  label?: string
}

export default function CvAIButton({ section, language, context, onResult, label }: CvAIButtonProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleClick = async () => {
    if (!user || loading) return
    setLoading(true)
    setDone(false)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/cv-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ section, language, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI assist failed')
      onResult(data.text)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-[10px] text-accent hover:opacity-80 disabled:opacity-40 transition-all duration-300"
      title={label || 'AI Assist'}
    >
      {loading ? (
        <Spinner size={12} className="animate-spin" />
      ) : done ? (
        <CheckCircle size={12} weight="fill" />
      ) : (
        <Sparkle size={12} weight="fill" />
      )}
      {loading ? 'Generating...' : done ? 'Done!' : label || 'AI Assist'}
    </button>
  )
}
