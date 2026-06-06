const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const LIMIT_SIZE = 900000

export function validateCvUpload(fileBase64: string, mimeType: string): void {
  if (!fileBase64) {
    throw new Error('fileBase64 required')
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Tipe file tidak didukung. Gunakan PDF/PNG/JPEG.')
  }

  if (fileBase64.length > LIMIT_SIZE) {
    throw new Error('CV terlalu besar. Maksimal ~700KB.')
  }
}

export function buildDataUrl(fileBase64: string, mimeType: string, fileName?: string): { url: string; path: string } {
  const dataUrl = `data:${mimeType || 'application/pdf'};base64,${fileBase64}`
  return { url: dataUrl, path: fileName || 'CV.pdf' }
}
