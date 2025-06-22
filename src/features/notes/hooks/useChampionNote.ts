import useSWR from 'swr'
import { createClient } from '@/shared/lib/supabase/client'
import type { Note } from '../types'

const fetchChampionNote = async (championId: string): Promise<Note | null> => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ユーザーが認証されていません')
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('champion_id', championId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export const useChampionNote = (championId: string | null) => {
  const { data, error, mutate } = useSWR(
    championId ? ['champion-note', championId] : null,
    () => fetchChampionNote(championId!),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    note: data || null,
    isLoading: !error && data === undefined,
    isError: error,
    mutate,
  }
}