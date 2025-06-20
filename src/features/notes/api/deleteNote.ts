import { createClient } from '@/shared/lib/supabase/client'

export const deleteNote = async (id: string) => {
  const supabase = createClient()

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}