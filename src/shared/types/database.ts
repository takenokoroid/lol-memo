export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          user_id: string
          champion_id: string | null
          title: string
          content: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          champion_id?: string | null
          title: string
          content: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          champion_id?: string | null
          title?: string
          content?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      matchup_notes: {
        Row: {
          id: string
          user_id: string
          champion_id: string
          opponent_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          champion_id: string
          opponent_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          champion_id?: string
          opponent_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      champion_notes_settings: {
        Row: {
          id: string
          user_id: string
          champion_id: string
          default_build: Json | null
          preferred_role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          champion_id: string
          default_build?: Json | null
          preferred_role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          champion_id?: string
          default_build?: Json | null
          preferred_role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}