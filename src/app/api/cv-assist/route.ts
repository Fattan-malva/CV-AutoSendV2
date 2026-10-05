import { NextRequest, NextResponse } from 'next/server'

const MODEL = process.env.OLLAMA_CLOUD_MODEL || 'gemma4:31b'
const API_KEY = process.env.OLLAMA_CLOUD_API_KEY || ''
const API_URL = `${process.env.OLLAMA_CLOUD_BASE_URL || 'https://ollama.com/v1'}/chat/completions`

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

function buildTranslatePrompt(targetLang: string) {
  const instruction = targetLang === 'en'
    ? `Translate the following CV data from Indonesian to English. Keep all JSON structure exactly the same. Translate ALL text fields (summary, position, company, bulletPoints, description, institution, degree, field, category, items, name, issuer, language fields). Preserve dates, numbers, and proper names. Output ONLY valid JSON, no explanation.`
    : `Terjemahkan data CV berikut dari Inggris ke Indonesia. Pertahankan struktur JSON persis sama. Terjemahkan SEMUA field teks (summary, position, company, bulletPoints, description, institution, degree, field, category, items, name, issuer, language fields). Jangan ubah tanggal, angka, dan nama orang/perusahaan. Output HANYA JSON valid, tanpa penjelasan.`
  return instruction
}

function extractJson(text: string): string {
  let cleaned = text.trim()
  const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) cleaned = jsonBlock[1].trim()
  const braceMatch = cleaned.match(/\{[\s\S]*\}/)
  if (braceMatch) cleaned = braceMatch[0]
  return cleaned
}

async function callOllama(body: object, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify(body),
    })
    if (res.ok) return res
    if ((res.status >= 500 || res.status === 429) && attempt < retries - 1) {
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

    if (section === 'translate-all') {
      const systemPrompt = `You are a professional CV translator. Translate CV content accurately while maintaining ATS-friendly formatting.`
      const instruction = buildTranslatePrompt(language)
      const userContext = context ? `\n\nCV data to translate:\n${context}` : ''

      const body = {
        model: MODEL, stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${instruction}${userContext}` },
        ],
      }

      const res = await callOllama(body)
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content

      if (!text) throw new Error('AI returned empty response')

      const jsonStr = extractJson(text)
      const translated = JSON.parse(jsonStr)

      return NextResponse.json({ translated })
    }

    const promptBuilder = SECTION_PROMPTS[section]
    if (!promptBuilder) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    const systemPrompt = `You are a professional CV writer and ATS optimization expert.`
    const instruction = promptBuilder(language)
    const userContext = context ? `\n\nUser data:\n${context}` : ''

    const body = {
      model: MODEL, stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${instruction}${userContext}` },
      ],
    }

    const res = await callOllama(body)
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content

    if (!text) {
      throw new Error('AI returned empty response')
    }

    return NextResponse.json({ text: text.trim() })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
