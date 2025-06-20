import useSWR from 'swr'
import { getMatchupNotes, getMatchupNote } from '../api/matchupNotes'
import type { MatchupNote } from '../types'

export const useMatchupNotes = (championId: string) => {
  return useSWR<MatchupNote[]>(
    championId ? `matchup-notes:${championId}` : null,
    () => getMatchupNotes(championId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
}

export const useMatchupNote = (championId: string, opponentId: string) => {
  return useSWR<MatchupNote | null>(
    championId && opponentId ? `matchup-note:${championId}:${opponentId}` : null,
    () => getMatchupNote(championId, opponentId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
}