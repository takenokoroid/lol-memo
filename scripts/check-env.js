#!/usr/bin/env node

/**
 * 環境変数のチェックスクリプト
 * ビルド前に必要な環境変数が設定されているか確認します
 */

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const optional = [
  'RIOT_API_KEY'
]

console.log('🔍 環境変数をチェックしています...\n')

let hasError = false

// 必須の環境変数をチェック
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ ${key} が設定されていません (必須)`)
    hasError = true
  } else {
    console.log(`✅ ${key} が設定されています`)
  }
})

// オプションの環境変数をチェック
optional.forEach(key => {
  if (!process.env[key]) {
    console.warn(`⚠️  ${key} が設定されていません (オプション)`)
  } else {
    console.log(`✅ ${key} が設定されています`)
  }
})

if (hasError) {
  console.error('\n❌ 必須の環境変数が不足しています。')
  console.error('📝 .env.local ファイルを作成し、.env.example を参考に設定してください。')
  process.exit(1)
} else {
  console.log('\n✅ 環境変数のチェックが完了しました。')
}