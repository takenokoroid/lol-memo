import { NextRequest, NextResponse } from 'next/server'
import { createAppAuthToken, setAppAuthCookie } from '@/lib/auth/app-auth'

// レート制限のための簡易的な実装
const attemptMap = new Map<string, { count: number; resetTime: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15分

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempt = attemptMap.get(ip)
  
  if (!attempt || now > attempt.resetTime) {
    attemptMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return true
  }
  
  if (attempt.count >= MAX_ATTEMPTS) {
    return false
  }
  
  attempt.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // IPアドレスを取得（Vercelの場合）
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    // レート制限チェック
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { password } = body
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    
    // 環境変数のパスワードと照合
    const appPassword = process.env.APP_PASSWORD
    if (!appPassword) {
      console.error('APP_PASSWORD not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    if (password !== appPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
    
    // JWTトークンを作成
    const token = await createAppAuthToken()
    
    // Cookieに設定
    await setAppAuthCookie(token)
    
    // 成功時はattemptをリセット
    attemptMap.delete(ip)
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('App verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}