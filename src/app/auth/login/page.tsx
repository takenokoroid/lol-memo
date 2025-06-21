import Link from 'next/link'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-normal text-gray-800 text-center mb-2">
              LoL メモにログイン
            </h2>
            <p className="text-sm text-gray-600 text-center">
              または{' '}
              <Link
                href="/auth/register"
                className="text-green-600 hover:bg-green-50 px-1 rounded"
              >
                新規アカウントを作成
              </Link>
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}