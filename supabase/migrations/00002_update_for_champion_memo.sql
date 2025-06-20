-- Remove match_id column from notes table (no longer needed)
ALTER TABLE notes DROP COLUMN IF EXISTS match_id;

-- Create matchup_notes table for champion vs champion notes
CREATE TABLE matchup_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  champion_id TEXT NOT NULL,
  opponent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, champion_id, opponent_id)
);

-- Create indexes for matchup_notes
CREATE INDEX idx_matchup_notes_user_id ON matchup_notes(user_id);
CREATE INDEX idx_matchup_notes_champion_id ON matchup_notes(champion_id);
CREATE INDEX idx_matchup_notes_opponent_id ON matchup_notes(opponent_id);
CREATE INDEX idx_matchup_notes_matchup ON matchup_notes(champion_id, opponent_id);

-- Apply updated_at trigger to matchup_notes
CREATE TRIGGER update_matchup_notes_updated_at BEFORE UPDATE ON matchup_notes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security for matchup_notes
ALTER TABLE matchup_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matchup_notes
CREATE POLICY "Users can view their own matchup notes" ON matchup_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matchup notes" ON matchup_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matchup notes" ON matchup_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matchup notes" ON matchup_notes
  FOR DELETE USING (auth.uid() = user_id);