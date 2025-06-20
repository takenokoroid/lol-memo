import { atom } from 'jotai'
import type { Note } from '../types'

export const selectedChampionIdAtom = atom<string | null>(null)
export const searchQueryAtom = atom('')
export const selectedTagsAtom = atom<string[]>([])

export const filteredNotesAtom = atom((get) => {
  const selectedChampionId = get(selectedChampionIdAtom)
  const searchQuery = get(searchQueryAtom)
  const selectedTags = get(selectedTagsAtom)
  
  return {
    championId: selectedChampionId,
    query: searchQuery,
    tags: selectedTags,
  }
})