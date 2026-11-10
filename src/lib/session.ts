import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

// Fail hard in production if SESSION_SECRET is not configured
const rawSecret = process.env.SESSION_SECRET
if (!rawSecret && process.env.NODE_ENV === 'production') {
  throw new Error(
    '[SECURITY] SESSION_SECRET environment variable is not set. ' +
    'Set a strong random string (minimum 32 characters) before deploying to production.'
  )
}
const secretKey = rawSecret || 'dev-only-fallback-key-do-not-use-in-production!!'
const encodedKey = new TextEncoder().encode(secretKey)

export type SessionPayload = {
  userId: string
  username: string
  role: string
  fullName?: string
  email?: string
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    return null
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt(payload)

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  return await decrypt(session)
}
