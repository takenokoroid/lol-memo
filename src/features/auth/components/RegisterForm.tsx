'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  confirmPassword: z.string().min(6, 'パスワードは6文字以上で入力してください'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const router = useRouter()
  const { signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await signUp(data.email, data.password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('User already registered')) {
        setError('このメールアドレスは既に登録されています。')
      } else {
        setError('登録に失敗しました。しばらくしてからもう一度お試しください。')
      }
      console.error('Registration error:', error)
    }
  }

  if (success) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-700">
          登録確認メールを送信しました。メールをご確認ください。
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
          メールアドレス
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          className="input-scrapbox"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
          パスワード
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          className="input-scrapbox"
          disabled={isSubmitting}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">
          パスワード（確認）
        </label>
        <input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          className="input-scrapbox"
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-scrapbox-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '登録中...' : '新規登録'}
      </button>
    </form>
  )
}