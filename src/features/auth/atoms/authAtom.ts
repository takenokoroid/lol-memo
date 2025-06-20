import { atom } from 'jotai'
import { User } from '@supabase/supabase-js'

export const userAtom = atom<User | null>(null)
export const isLoadingAuthAtom = atom(true)
export const isAuthenticatedAtom = atom((get) => !!get(userAtom))