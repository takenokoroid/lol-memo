import { DDRAGON_BASE_URL, DDRAGON_VERSION } from '@/shared/lib/riot-api/config'
import type { ChampionData } from '../types'

export const getChampions = async (): Promise<ChampionData> => {
  const url = `${DDRAGON_BASE_URL}/cdn/${DDRAGON_VERSION}/data/ja_JP/champion.json`
  
  const response = await fetch(url, {
    next: {
      revalidate: 3600, // Cache for 1 hour
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch champions: ${response.status}`)
  }
  
  return response.json()
}