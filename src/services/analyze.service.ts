import { GoogleGenAI } from '@google/genai'
import { encrypt } from '@/lib/crypto'
import type { AnalysisResult } from '@/types'

function getAi() {
  const key = process.env.GOOGLE_AI_STUDIO_API_KEY
  if (!key) return null
  return new GoogleGenAI({ apiKey: key })
}

const MODEL = process.env.GOOGLE_AI_STUDIO_MODEL || 'gemma-4-31b-it'

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
  const ai = getAi()
  if (!ai) {
    throw new Error('AI not configured')
  }

  const prompt = SYSTEM_PROMPT(senderName || 'Pelamar')

  const contents = [
    { role: 'user', parts: [{ text: prompt }] },
    {
      role: 'user',
      parts: [
        { text: 'Analisis brosur lowongan ini:' },
        { inlineData: { mimeType, data: imageData } },
      ],
    },
  ]

  const resp = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {},
  })

  const text = resp.text
  if (!text) {
    throw new Error('AI returned empty response')
  }

  let jsonText = text.trim()

  const jsonBlock = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonBlock) {
    jsonText = jsonBlock[1].trim()
  }

  const braceMatch = jsonText.match(/\{[\s\S]*\}/)
  if (braceMatch) {
    jsonText = braceMatch[0]
  }

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
