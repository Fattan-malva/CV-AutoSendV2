import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AuthError } from '@/services/auth.service'
import { validateCvUpload, buildDataUrl } from '@/services/cv.service'

export async function POST(req: NextRequest) {
  try {
    await verifyToken(req.headers.get('authorization'))

    const { fileName, fileBase64, mimeType } = await req.json()
    validateCvUpload(fileBase64, mimeType)

    const result = buildDataUrl(fileBase64, mimeType, fileName)

    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
