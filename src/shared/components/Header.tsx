'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Menu, X, ChevronDown } from 'lucide-react'

export const Header = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4">
        <div className="flex justify-between items-center h-12">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-lg font-normal text-gray-800 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            >
              LoL Memo
            </Link>
            
            {user && (
              <nav className="hidden md:flex ml-8 space-x-1">
                <Link
                  href="/champions"
                  className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                >
                  チャンピオン
                </Link>
                <Link
                  href="/notes"
                  className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                >
                  メモ一覧
                </Link>
              </nav>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                >
                  <span>{user.email}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded border border-gray-200 py-1">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-scrapbox-primary text-sm"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-gray-600 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {user ? (
              <>
                <div className="pb-2 mb-2 border-b border-gray-200">
                  <p className="text-xs text-gray-500">ログイン中</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
                <Link
                  href="/champions"
                  className="block py-2 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  チャンピオン
                </Link>
                <Link
                  href="/notes"
                  className="block py-2 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  メモ一覧
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 px-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block py-2 px-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/register"
                  className="block py-2 px-2 text-sm text-green-600 hover:bg-green-50 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}