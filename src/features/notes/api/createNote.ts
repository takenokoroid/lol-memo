import { createClient } from '@/shared/lib/supabase/client'
import type { CreateNoteRequest } from '../types'

export const createNote = async (note: CreateNoteRequest) => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ユーザーが認証されていません')
  }

  // champion_idが指定されている場合は、既存のメモをチェック
  if (note.champion_id) {
    const { data: existingNote } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', user.id)
      .eq('champion_id', note.champion_id)
      .single()

    // 既存のメモがある場合は更新
    if (existingNote) {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingNote.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    }
  }

  // 新規作成
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