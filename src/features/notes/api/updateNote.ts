import { createClient } from '@/shared/lib/supabase/client'
import type { UpdateNoteRequest } from '../types'

export const updateNote = async (id: string, updates: UpdateNoteRequest) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}