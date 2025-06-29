/**
 * Supabase設定ユーティリティ
 * ビルド時と実行時の環境変数の扱いを統一
 */

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // ビルド時またはサーバーサイドで環境変数が無い場合はダミー値を使用
  if (!url || !anonKey) {
    // ビルド時は警告を出さない（Vercelのビルド時には環境変数がまだ注入されていない可能性）
    if (typeof window !== 'undefined') {
      console.warn('Supabase環境変数が設定されていません。')
    }
    return {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-anon-key',
      isConfigured: false
    }
  }

  return {
    url,
    anonKey,
    isConfigured: true
  }
}