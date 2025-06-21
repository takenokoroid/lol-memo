'use client'

import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { FileText, Users, Search } from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="mb-16">
        <h1 className="text-2xl mb-4">LoL Memo</h1>
        <p className="text-gray-600 mb-2">
          League of Legends チャンピオンメモアプリ
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          チャンピオンの戦略、ビルド、対面情報を効率的に管理して、ランクゲームでの勝率を向上させましょう。
        </p>
      </div>

      {/* Quick Links */}
      {user ? (
        <div className="mb-16">
          <div className="border-l-2 border-gray-300 pl-4 space-y-2">
            <Link
              href="/champions"
              className="block text-green-600 hover:bg-gray-100 py-1 px-2 -ml-2 rounded transition-colors"
            >
              チャンピオン一覧
            </Link>
            <Link
              href="/notes"
              className="block text-green-600 hover:bg-gray-100 py-1 px-2 -ml-2 rounded transition-colors"
            >
              メモ一覧
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-16">
          <div className="border-l-2 border-gray-300 pl-4 space-y-2">
            <Link
              href="/auth/register"
              className="block text-green-600 hover:bg-gray-100 py-1 px-2 -ml-2 rounded transition-colors"
            >
              新規登録
            </Link>
            <Link
              href="/auth/login"
              className="block text-green-600 hover:bg-gray-100 py-1 px-2 -ml-2 rounded transition-colors"
            >
              ログイン
            </Link>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-xl mb-6">主な機能</h2>
        
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base mb-1">チャンピオンメモ</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                各チャンピオンの戦略、ビルド、プレイスタイルを記録できます。タグを使って整理し、必要な時にすぐに参照できます。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base mb-1">対面メモ</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                チャンピオン vs チャンピオンの対面情報を管理。マッチアップごとの注意点や戦略を記録できます。
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base mb-1">簡単検索</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                チャンピオン名、ロール、タグで素早く検索。必要な情報にすぐにアクセスできます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {!user && (
        <div className="border-t pt-8">
          <p className="text-sm text-gray-600 mb-4">
            無料でアカウントを作成して、あなたのLoLメモを管理しましょう。
          </p>
          <Link
            href="/auth/register"
            className="btn-scrapbox-primary"
          >
            無料で新規登録
          </Link>
        </div>
      )}
    </div>
  )
}