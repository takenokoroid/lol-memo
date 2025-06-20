'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'

export const Header = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              LoL Memo
            </Link>
            
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  href="/champions"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  チャンピオン
                </Link>
                <Link
                  href="/notes"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  メモ一覧
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <nav className="px-4 py-3 space-y-2">
            <Link
              href="/champions"
              className="block text-gray-600 hover:text-gray-900 transition-colors"
            >
              チャンピオン
            </Link>
            <Link
              href="/notes"
              className="block text-gray-600 hover:text-gray-900 transition-colors"
            >
              メモ一覧
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}