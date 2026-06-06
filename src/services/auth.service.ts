import { getAuthAdmin } from '@/lib/firebase-admin'

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function verifyToken(authHeader: string | null): Promise<string> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Unauthorized', 401)
  }

  const token = authHeader.slice(7)
  const authAdmin = getAuthAdmin()
  if (!authAdmin) {
    throw new AuthError('Server config error', 500)
  }

  const decoded = await authAdmin.verifyIdToken(token)
  return decoded.uid
}
