import { createClient } from '@/shared/lib/supabase/client'
import type { CreateNoteRequest } from '../types'

export const createNote = async (note: CreateNoteRequest) => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ユーザーが認証されていません')
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      ...note,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}