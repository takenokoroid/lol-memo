import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { createClient } from '@/shared/lib/supabase/client'
import { userAtom, isLoadingAuthAtom } from '../atoms/authAtom'

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAuthAtom)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUser, setIsLoading])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }
}