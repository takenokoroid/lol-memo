import { createClient } from '@/shared/lib/supabase/client'
import type { MatchupNote, CreateMatchupNoteRequest, UpdateMatchupNoteRequest } from '../types'

export const getMatchupNotes = async (championId: string): Promise<MatchupNote[]> => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('matchup_notes')
    .select('*')
    .eq('champion_id', championId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw error
  }
  
  return data
}

export const getMatchupNote = async (championId: string, opponentId: string): Promise<MatchupNote | null> => {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('matchup_notes')
    .select('*')
    .eq('champion_id', championId)
    .eq('opponent_id', opponentId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }
  
  return data
}

export const createMatchupNote = async (note: CreateMatchupNoteRequest): Promise<MatchupNote> => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ユーザーが認証されていません')
  }

  const { data, error } = await supabase
    .from('matchup_notes')
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

export const updateMatchupNote = async (id: string, updates: UpdateMatchupNoteRequest): Promise<MatchupNote> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matchup_notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export const deleteMatchupNote = async (id: string): Promise<void> => {
  const supabase = createClient()

  const { error } = await supabase
    .from('matchup_notes')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export const upsertMatchupNote = async (
  championId: string,
  opponentId: string,
  content: string
): Promise<MatchupNote> => {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('ユーザーが認証されていません')
  }

  const { data, error } = await supabase
    .from('matchup_notes')
    .upsert({
      user_id: user.id,
      champion_id: championId,
      opponent_id: opponentId,
      content,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}