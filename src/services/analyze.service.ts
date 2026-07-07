import { encrypt } from '@/lib/crypto'
import type { AnalysisResult } from '@/types'

const MODEL = process.env.GOOGLE_AI_STUDIO_MODEL || 'gemma-4-31b-it'
const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY || ''
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

const SYSTEM_PROMPT = (nama: string) => `Kamu adalah asisten yang membantu melamar kerja dengan nama pengirim: "${nama}".
Analisis brosur lowongan kerja dan keluarkan JSON dengan field:
- subjek: ikuti format subjek yang diminta brosur jika ada (contoh: "IT_Fatan"), jika brosur tidak menentukan format maka buat sendiri (contoh: "Lamaran Posisi {posisi} di {nama_perusahaan}")
- nama_perusahaan: nama perusahaan
- posisi: posisi yang dilamar
- email: email tujuan untuk kirim lamaran (string kosong jika tidak ada)
- intro: 1 paragraf intro perkenalan. Awali dengan "Perkenalkan nama saya ${nama}," lalu jelaskan ketertarikan.
- alasan: 1 paragraf alasan melamar
- penutup: 1 paragraf penutup. Akhiri dengan "Hormat saya,\\n${nama}" (gunakan \\n untuk newline)`

export async function analyzeBrochure(imageData: string, mimeType: string, senderName: string): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error('AI not configured')
  }

  const body = {
    contents: [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT(senderName || 'Pelamar') }] },
      {
        role: 'user',
        parts: [
          { text: 'Analisis brosur lowongan ini:' },
          { inlineData: { mimeType, data: imageData } },
        ],
      },
    ],
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText)
  }

  const data = await res.json()
  const part = data?.candidates?.[0]?.content?.parts?.find((p: { thought?: boolean }) => !p.thought)
  const text = part?.text || data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('AI returned empty response')
  }

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
