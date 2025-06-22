export interface Note {
  id: string
  user_id: string
  champion_id: string
  title: string
  content: string
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface CreateNoteRequest {
  champion_id: string
  title: string
  content: string
  tags?: string[]
}

export interface UpdateNoteRequest {
  champion_id?: string
  title?: string
  content?: string
  tags?: string[]
}

export interface MatchupNote {
  id: string
  user_id: string
  champion_id: string
  opponent_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CreateMatchupNoteRequest {
  champion_id: string
  opponent_id: string
  content: string
}

export interface UpdateMatchupNoteRequest {
  content?: string
}