'use client'

import { ReactNode } from 'react'
import { Provider } from 'jotai'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface AuthProviderProps {
  children: ReactNode
}

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
        ></div>
      </div>
    )
  }

  return <>{children}</>
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <Provider>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  )
}