import Link from 'next/link'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-normal text-gray-800 text-center mb-2">
              新規アカウント作成
            </h2>
            <p className="text-sm text-gray-600 text-center">
              既にアカウントをお持ちの方は{' '}
              <Link
                href="/auth/login"
                className="text-green-600 hover:bg-green-50 px-1 rounded"
              >
                ログイン
              </Link>
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}