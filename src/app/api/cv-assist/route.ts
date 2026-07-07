import { NextRequest, NextResponse } from 'next/server'

const MODEL = process.env.GOOGLE_AI_STUDIO_MODEL || 'gemma-4-31b-it'
const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY || ''
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

const SECTION_PROMPTS: Record<string, (lang: string) => string> = {
  summary: (lang) => lang === 'en'
    ? `Write a professional CV summary/objective (2-3 sentences) based on the user's experience below. Be concise, ATS-friendly, and impactful. Output ONLY the summary text, no JSON.`
    : `Tulis ringkasan/objektif CV profesional (2-3 kalimat) berdasarkan pengalaman user di bawah. Ringkas, ATS-friendly, dan berdampak. Output HANYA teks ringkasan, tanpa JSON.`,
  bullet: (lang) => lang === 'en'
    ? `Rewrite the following job description into 3-4 ATS-optimized bullet points for a CV. Use strong action verbs, include quantifiable results where possible. Output ONLY the bullet points, one per line, no JSON.`
    : `Tulis ulang deskripsi pekerjaan berikut menjadi 3-4 poin penting yang dioptimalkan untuk ATS di CV. Gunakan kata kerja aksi yang kuat, sertakan hasil yang terukur jika memungkinkan. Output HANYA poin-poin, satu per baris, tanpa JSON.`,
  skills: (lang) => lang === 'en'
    ? `Based on the work experience provided, suggest 8-12 relevant technical and soft skills for a CV. Group them by category. Output ONLY as: "Category: skill1, skill2, skill3" one category per line. No JSON.`
    : `Berdasarkan pengalaman kerja yang diberikan, sarankan 8-12 skill teknis dan soft skill yang relevan untuk CV. Kelompokkan berdasarkan kategori. Output HANYA sebagai: "Kategori: skill1, skill2, skill3" satu kategori per baris. Tanpa JSON.`,
}

async function callGemma(body: object, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) return res
    if (res.status >= 500 && attempt < retries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 8000)
      await new Promise(r => setTimeout(r, delay))
      continue
    }
    const errText = await res.text()
    throw new Error(errText)
  }
  throw new Error('AI unavailable after retries')
}

export async function POST(req: NextRequest) {
  try {
    const { section, language, context } = await req.json()

    if (!section || !language) {
      return NextResponse.json({ error: 'section and language required' }, { status: 400 })
    }

    const promptBuilder = SECTION_PROMPTS[section]
    if (!promptBuilder) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const systemPrompt = `You are a professional CV writer and ATS optimization expert.`
    const instruction = promptBuilder(language)
    const userContext = context ? `\n\nUser data:\n${context}` : ''

    const body = {
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: `${instruction}${userContext}` }] },
      ],
    }

    const res = await callGemma(body)
    const data = await res.json()
    const part = data?.candidates?.[0]?.content?.parts?.find((p: { thought?: boolean }) => !p.thought)
    const text = part?.text || data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error('AI returned empty response')
    }

    return NextResponse.json({ text: text.trim() })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
