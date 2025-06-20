import useSWR from 'swr'
import { createClient } from '@/shared/lib/supabase/client'
import type { Note } from '../types'

const fetcher = async (id: string): Promise<Note> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    throw error
  }
  
  return data
}

export const useNote = (id: string) => {
  return useSWR(id ? `note:${id}` : null, () => fetcher(id), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
}