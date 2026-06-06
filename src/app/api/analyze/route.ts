import { NextRequest, NextResponse } from 'next/server'
import { analyzeBrochure, encryptResult } from '@/services/analyze.service'

export async function POST(req: NextRequest) {
  try {
    const { imageData, mimeType: reqMimeType, uid, senderName } = await req.json()

    if (!imageData) {
      return NextResponse.json({ error: 'imageData required' }, { status: 400 })
    }

    const mimeType = reqMimeType || 'image/jpeg'
    const result = await analyzeBrochure(imageData, mimeType, senderName || 'Pelamar')
    const encrypted = encryptResult(result, uid)

    return NextResponse.json(encrypted)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
