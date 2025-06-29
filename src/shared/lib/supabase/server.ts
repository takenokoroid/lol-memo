import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/shared/types/database'
import { getSupabaseConfig } from './config'

export const createClient = async () => {
  const cookieStore = await cookies()
  const config = getSupabaseConfig()

  // サーバーサイドで設定が無い場合、警告を出してダミークライアントを返す
  if (!config.isConfigured) {
    console.warn(
      'Supabase環境変数が設定されていません。ビルド時はダミークライアントを使用します。'
    )
  }

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}