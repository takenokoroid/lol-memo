import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const APP_AUTH_COOKIE = 'app-auth-token'
const JWT_ALG = 'HS256'

export async function createAppAuthToken(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  
  const jwt = await new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  
  return jwt
}

export async function verifyAppAuthToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret, {
      algorithms: [JWT_ALG]
    })
    return true
  } catch {
    return false
  }
}

export async function setAppAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(APP_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export async function getAppAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(APP_AUTH_COOKIE)?.value
}

export function getAppAuthCookieFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(APP_AUTH_COOKIE)?.value
}

export async function clearAppAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(APP_AUTH_COOKIE)
}

export async function isAppAuthenticated(): Promise<boolean> {
  const token = await getAppAuthCookie()
  if (!token) return false
  return verifyAppAuthToken(token)
}

export function isAppAuthenticatedFromRequest(request: NextRequest): Promise<boolean> {
  const token = getAppAuthCookieFromRequest(request)
  if (!token) return Promise.resolve(false)
  return verifyAppAuthToken(token)
}