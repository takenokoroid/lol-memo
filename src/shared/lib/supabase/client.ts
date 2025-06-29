import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/shared/types/database'
import { getSupabaseConfig } from './config'

export const createClient = () => {
  const config = getSupabaseConfig()

  // クライアントサイドで設定が無い場合は警告のみ（ビルドを通すため）
  if (typeof window !== 'undefined' && !config.isConfigured) {
    console.error(
      'Supabase環境変数が設定されていません。認証機能は利用できません。'
    )
  }

  return createBrowserClient<Database>(config.url, config.anonKey)
}