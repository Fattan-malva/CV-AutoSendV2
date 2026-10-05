import { encrypt } from '@/lib/crypto'
import type { AnalysisResult } from '@/types'

const MODEL = process.env.OLLAMA_CLOUD_MODEL || 'gemma4:31b'
const API_KEY = process.env.OLLAMA_CLOUD_API_KEY || ''
const API_URL = `${process.env.OLLAMA_CLOUD_BASE_URL || 'https://ollama.com/v1'}/chat/completions`

const SYSTEM_PROMPT_ID = (nama: string) => `Kamu adalah asisten yang membantu melamar kerja dengan nama pengirim: "${nama}".
Analisis brosur lowongan kerja dan keluarkan JSON dengan field:
- subjek: ikuti format subjek yang diminta brosur jika ada (contoh: "IT_Fatan"), jika brosur tidak menentukan format maka buat sendiri (contoh: "Lamaran Posisi {posisi} di {nama_perusahaan}")
- nama_perusahaan: nama perusahaan
- posisi: posisi yang dilamar
- email: email tujuan untuk kirim lamaran (string kosong jika tidak ada)
- intro: 1 paragraf intro perkenalan. Awali dengan "Perkenalkan nama saya ${nama}," lalu jelaskan ketertarikan.
- alasan: 1 paragraf alasan melamar
- penutup: 1 paragraf penutup. Akhiri dengan "Hormat saya,\\n${nama}" (gunakan \\n untuk newline)`

const SYSTEM_PROMPT_EN = (nama: string) => `You are an assistant helping apply for jobs. Sender name: "${nama}".
Analyze the job vacancy brochure and output JSON with fields:
- subjek: follow the subject format requested by the brochure if any (e.g. "IT_Fatan"), if none specified create your own (e.g. "Application for {posisi} at {nama_perusahaan}")
- nama_perusahaan: company name
- posisi: position being applied for
- email: target email to send application to (empty string if not available)
- intro: 1 paragraph introduction. Start with "My name is ${nama}," then explain interest.
- alasan: 1 paragraph reason for applying
- penutup: 1 paragraph closing. End with "Best regards,\\n${nama}" (use \\n for newline)`

async function callOllama(body: object, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
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

  throw new Error('Ollama Cloud API unavailable after retries')
}

async function parseGemmaJson(text: string): Promise<AnalysisResult> {
  let jsonText = text.trim()
  const jsonBlock = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) jsonText = jsonBlock[1].trim()
  const braceMatch = jsonText.match(/\{[\s\S]*\}/)
  if (braceMatch) jsonText = braceMatch[0]

  try {
    return JSON.parse(jsonText) as AnalysisResult
  } catch {
    throw new Error(`AI returned invalid JSON. Response: ${text.slice(0, 500)}`)
  }
}

export async function analyzeBrochure(imageData: string, mimeType: string, senderName: string, language: 'id' | 'en' = 'id'): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error('AI not configured')
  }

  const prompt = language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ID
  const instructionText = language === 'en' ? 'Analyze this job vacancy brochure:' : 'Analisis brosur lowongan ini:'

  const body = {
    model: MODEL,
    stream: false,
    messages: [
      { role: 'system', content: prompt(senderName || (language === 'en' ? 'Applicant' : 'Pelamar')) },
      {
        role: 'user',
        content: [
          { type: 'text', text: instructionText },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageData}` } },
        ],
      },
    ],
  }

  const res = await callOllama(body)
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content

  if (!text) {
    throw new Error('AI returned empty response')
  }

  return parseGemmaJson(text)
}

export function encryptResult(result: AnalysisResult, uid: string | null): AnalysisResult {
  if (!uid) return result

  return {
    ...result,
    subjek: encrypt(result.subjek),
    intro: encrypt(result.intro),
    alasan: encrypt(result.alasan),
    penutup: encrypt(result.penutup),
  }
}
