import useSWR from 'swr'
import { getChampions } from '../api/getChampions'
import type { ChampionData } from '../types'

export const useChampions = () => {
  return useSWR<ChampionData>('champions', getChampions, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })
}