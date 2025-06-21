import { useChampions } from './useChampions'
import type { Champion } from '../types'

export const useChampion = (championId: string) => {
  const { data: championData, error, isLoading } = useChampions()
  
  const champion = championData?.data?.[championId] || null
  
  return {
    data: champion as Champion | null,
    error,
    isLoading,
  }
}