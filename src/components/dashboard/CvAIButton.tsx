'use client'

import { useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

interface CvAIButtonProps {
  section: string
  language: 'id' | 'en'
  context: string
  onResult: (text: string) => void
  label?: string
}

export default function CvAIButton({
  section,
  language,
  context,
  onResult,
  label,
}: CvAIButtonProps) {
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ section, language, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI assist failed')
      onResult(data.text)
      setDone(true)
      toast.success('AI suggestion applied')
      setTimeout(() => setDone(false), 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI assist failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      onClick={() => void handleClick()}
      disabled={loading}
      title={label || 'AI Assist'}
      className='h-6 gap-1 px-1.5 text-[10px] text-primary hover:text-primary'
    >
      {loading ? (
        <Loader2 className='size-3 animate-spin' />
      ) : done ? (
        <Check className='size-3' />
      ) : (
        <Sparkles className='size-3' />
      )}
      {loading ? 'Generating…' : done ? 'Done!' : label || 'AI Assist'}
    </Button>
  )
}
