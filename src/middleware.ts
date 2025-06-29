import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAppAuthenticatedFromRequest } from '@/lib/auth/app-auth'

export async function middleware(request: NextRequest) {
  // アプリ認証のチェック（/auth/app-login以外のすべてのルートで必要）
  if (!request.nextUrl.pathname.startsWith('/auth/app-login') && 
      !request.nextUrl.pathname.startsWith('/api/auth/app-verify')) {
    const isAppAuth = await isAppAuthenticatedFromRequest(request)
    if (!isAppAuth) {
      const loginUrl = new URL('/auth/app-login', request.url)
      loginUrl.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/notes') ||
      request.nextUrl.pathname.startsWith('/champions')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    if (user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}