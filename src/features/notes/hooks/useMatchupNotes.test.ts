import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useMatchupNotes, useMatchupNote } from './useMatchupNotes'
import { getMatchupNotes, getMatchupNote } from '../api/matchupNotes'
import { noteFixtures } from '@/__mocks__/fixtures/noteData'
import React from 'react'

// Mock the API functions
jest.mock('../api/matchupNotes')
const mockGetMatchupNotes = getMatchupNotes as jest.MockedFunction<typeof getMatchupNotes>
const mockGetMatchupNote = getMatchupNote as jest.MockedFunction<typeof getMatchupNote>

// SWR Provider wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      SWRConfig,
      {
        value: {
          provider: () => new Map(),
          dedupingInterval: 0,
        },
      },
      children
    )
  }
}

describe('useMatchupNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useMatchupNotes', () => {
    describe('正常系', () => {
      it('指定したチャンピオンの対面メモ一覧を取得できる', async () => {
        // Arrange
        const championId = 'Aatrox'
        const mockMatchupNotes = noteFixtures.multipleMatchupNotes(championId, 3)
        
        mockGetMatchupNotes.mockResolvedValue(mockMatchupNotes)

        // Act
        const { result } = renderHook(() => useMatchupNotes(championId), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.isLoading).toBe(true)
        
        await waitFor(() => {
          expect(result.current.data).toEqual(mockMatchupNotes)
        })
        
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
        expect(mockGetMatchupNotes).toHaveBeenCalledTimes(1)
        expect(mockGetMatchupNotes).toHaveBeenCalledWith(championId)
      })

      it('対面メモが存在しない場合は空配列を返す', async () => {
        // Arrange
        const championId = 'UnusedChampion'
        
        mockGetMatchupNotes.mockResolvedValue([])

        // Act
        const { result } = renderHook(() => useMatchupNotes(championId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.data).toEqual([])
        })
        
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
      })

    })

    describe('エラーハンドリング', () => {
      it('API呼び出しでエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const championId = 'ErrorChamp'
        const apiError = new Error('Failed to fetch matchup notes')
        
        mockGetMatchupNotes.mockRejectedValue(apiError)

        // Act
        const { result } = renderHook(() => useMatchupNotes(championId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.error).toEqual(apiError)
        })
        
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
      })

      it('ネットワークエラーの場合も適切にエラーを返す', async () => {
        // Arrange
        const championId = 'NetworkErrorChamp'
        const networkError = new Error('Network request failed')
        
        mockGetMatchupNotes.mockRejectedValue(networkError)

        // Act
        const { result } = renderHook(() => useMatchupNotes(championId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.error).toEqual(networkError)
        })
      })
    })

    describe('パラメータ検証', () => {
      it('championIdが空文字の場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNotes(''), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNotes).not.toHaveBeenCalled()
      })

      it('championIdがnullの場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNotes(null as any), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNotes).not.toHaveBeenCalled()
      })

      it('championIdがundefinedの場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNotes(undefined as any), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNotes).not.toHaveBeenCalled()
      })
    })

    describe('キャッシュ動作', () => {
      it('同じchampionIdで複数回呼び出された場合、キャッシュが使用される', async () => {
        // Arrange
        const championId = 'CachedChamp'
        const mockNotes = noteFixtures.multipleMatchupNotes(championId, 2)
        
        mockGetMatchupNotes.mockResolvedValue(mockNotes)

        // Act
        const { result: result1 } = renderHook(() => useMatchupNotes(championId), {
          wrapper: createWrapper(),
        })
        
        await waitFor(() => {
          expect(result1.current.data).toEqual(mockNotes)
        })
        
        // 同じキーで再度呼び出し
        const { result: result2 } = renderHook(() => useMatchupNotes(championId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result2.current.data).toEqual(mockNotes)
        })
        
        expect(result1.current.data).toEqual(result2.current.data)
        expect(mockGetMatchupNotes).toHaveBeenCalled() // API呼び出しが発生
      })
    })
  })

  describe('useMatchupNote', () => {
    describe('正常系', () => {
      it('指定したチャンピオンと対戦相手の対面メモを取得できる', async () => {
        // Arrange
        const championId = 'Aatrox'
        const opponentId = 'Renekton'
        const mockMatchupNote = noteFixtures.aatroxVsRenekton()
        
        mockGetMatchupNote.mockResolvedValue(mockMatchupNote)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.isLoading).toBe(true)
        
        await waitFor(() => {
          expect(result.current.data).toEqual(mockMatchupNote)
        })
        
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
        expect(mockGetMatchupNote).toHaveBeenCalledTimes(1)
        expect(mockGetMatchupNote).toHaveBeenCalledWith(championId, opponentId)
      })

      it('対面メモが存在しない場合はnullを返す', async () => {
        // Arrange
        const championId = 'Yasuo'
        const opponentId = 'Zed'
        
        mockGetMatchupNote.mockResolvedValue(null)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.data).toBeNull()
        })
        
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
      })

    })

    describe('エラーハンドリング', () => {
      it('API呼び出しでエラーが発生した場合はエラーを返す', async () => {
        // Arrange
        const championId = 'ErrorChamp'
        const opponentId = 'ErrorOpponent'
        const apiError = new Error('Failed to fetch matchup note')
        
        mockGetMatchupNote.mockRejectedValue(apiError)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.error).toEqual(apiError)
        })
        
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
      })

      it('データベースエラーの場合も適切にエラーを返す', async () => {
        // Arrange
        const championId = 'DBErrorChamp'
        const opponentId = 'DBErrorOpponent'
        const dbError = new Error('Database connection failed')
        
        mockGetMatchupNote.mockRejectedValue(dbError)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.error).toEqual(dbError)
        })
      })
    })

    describe('パラメータ検証', () => {
      it('championIdが空文字の場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNote('', 'Renekton'), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNote).not.toHaveBeenCalled()
      })

      it('opponentIdが空文字の場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNote('Aatrox', ''), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNote).not.toHaveBeenCalled()
      })

      it('両方のIDが空文字の場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNote('', ''), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNote).not.toHaveBeenCalled()
      })

      it('championIdがnullの場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNote(null as any, 'Renekton'), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNote).not.toHaveBeenCalled()
      })

      it('opponentIdがundefinedの場合はAPIを呼び出さない', () => {
        // Act
        const { result } = renderHook(() => useMatchupNote('Aatrox', undefined as any), {
          wrapper: createWrapper(),
        })

        // Assert
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
        expect(mockGetMatchupNote).not.toHaveBeenCalled()
      })
    })

    describe('キャッシュ動作', () => {
      it('同じ組み合わせで複数回呼び出された場合、キャッシュが使用される', async () => {
        // Arrange
        const championId = 'CachedChamp'
        const opponentId = 'CachedOpponent'
        const mockNote = noteFixtures.aatroxVsRenekton()
        
        mockGetMatchupNote.mockResolvedValue(mockNote)

        // Act
        const { result: result1 } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })
        
        await waitFor(() => {
          expect(result1.current.data).toEqual(mockNote)
        })
        
        // 同じキーで再度呼び出し
        const { result: result2 } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result2.current.data).toEqual(mockNote)
        })
        
        expect(result1.current.data).toEqual(result2.current.data)
        expect(mockGetMatchupNote).toHaveBeenCalled() // API呼び出しが発生
      })

      it('mutateを使ってキャッシュを更新できる', async () => {
        // Arrange
        const championId = 'MutableChamp'
        const opponentId = 'MutableOpponent'
        const initialNote = noteFixtures.aatroxVsRenekton()
        const updatedNote = { ...initialNote, content: '更新されたメモ内容' }
        
        mockGetMatchupNote.mockResolvedValue(initialNote)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        await waitFor(() => {
          expect(result.current.data).toEqual(initialNote)
        })

        // mutateでデータを更新
        mockGetMatchupNote.mockResolvedValue(updatedNote)
        await act(async () => {
          await result.current.mutate()
        })

        // Assert
        await waitFor(() => {
          expect(result.current.data).toEqual(updatedNote)
        })
      })
    })

    describe('SWR設定', () => {
      it('正しいキーでSWRを呼び出す', async () => {
        // Arrange
        const championId = 'TestChamp'
        const opponentId = 'TestOpponent'
        const mockNote = noteFixtures.aatroxVsRenekton()
        
        mockGetMatchupNote.mockResolvedValue(mockNote)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.data).toEqual(mockNote)
        })
        
        expect(mockGetMatchupNote).toHaveBeenCalledWith(championId, opponentId)
      })

      it('revalidateOnFocusがfalseに設定されている', async () => {
        // Arrange
        const championId = 'FocusTestChamp'
        const opponentId = 'FocusTestOpponent'
        const mockNote = noteFixtures.aatroxVsRenekton()
        
        mockGetMatchupNote.mockResolvedValue(mockNote)

        // Act
        const { result } = renderHook(() => useMatchupNote(championId, opponentId), {
          wrapper: createWrapper(),
        })

        // Assert
        await waitFor(() => {
          expect(result.current.data).toEqual(mockNote)
        })
        
        expect(result.current.isValidating).toBe(false)
      })
    })
  })
})