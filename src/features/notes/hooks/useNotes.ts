import useSWR from 'swr'
import { createClient } from '@/shared/lib/supabase/client'
import type { Note } from '../types'

const fetcher = async (key: string): Promise<Note[]> => {
  const supabase = createClient()
  const [, championId] = key.split(':')
  
  let query = supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (championId && championId !== 'all') {
    query = query.eq('champion_id', championId)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw error
  }
  
  return data
}

export const useNotes = (championId?: string) => {
  const key = `notes:${championId || 'all'}`
  
  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
}