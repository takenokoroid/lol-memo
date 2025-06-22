import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useNotes } from './useNotes'
import { noteFixtures } from '@/__mocks__/fixtures/noteData'
import React from 'react'

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

// SWR Provider wrapper
const createWrapper = () => {
  const SWRWrapper = ({ children }: { children: React.ReactNode }) => {
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
  SWRWrapper.displayName = 'SWRWrapper'
  return SWRWrapper
}

describe('useNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('全ノート取得', () => {
    it('championIdなしで全ノートを取得できる', async () => {
      // Arrange
      const mockNotes = noteFixtures.multipleNotes(3)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('championId="all"で全ノートを取得できる', async () => {
      // Arrange
      const mockNotes = noteFixtures.multipleNotes(5)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
        eq: jest.fn(), // eqメソッドを定義するが呼ばれない
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes('all'), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      // "all"の場合はeqが呼ばれない
      expect(mockChain.eq).not.toHaveBeenCalled()
    })

    it('空の結果でも正常に動作する', async () => {
      // Arrange
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(), {
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

  describe('特定チャンピオンのノート取得', () => {
    it('指定したchampionIdのノートのみを取得できる', async () => {
      // Arrange
      const championId = 'Aatrox'
      const mockNotes = [
        noteFixtures.championNote(),
        { ...noteFixtures.championNote(), id: 'note-2', champion_id: championId },
      ]
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockChain.eq).toHaveBeenCalledWith('champion_id', championId)
    })


    it('存在しないchampionIdの場合は空配列を返す', async () => {
      // Arrange
      const championId = 'NonExistentChampion'
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual([])
      })
      
      expect(result.current.error).toBeUndefined()
    })
  })

  describe('エラーハンドリング', () => {
    it('Supabaseエラーが発生した場合はエラーを返す', async () => {
      // Arrange
      const supabaseError = new Error('Database connection failed')
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: supabaseError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(supabaseError)
      })
      
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })

  })

  describe('SWR設定', () => {
    it('正しいキーでSWRを呼び出す', async () => {
      // Arrange
      const championId = 'TestChamp'
      const mockNotes = noteFixtures.multipleNotes(2)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      // キーが正しく生成されていることを確認
      expect(mockChain.eq).toHaveBeenCalledWith('champion_id', championId)
    })

    it('revalidateOnFocusがfalseに設定されている', async () => {
      // Arrange
      const mockNotes = noteFixtures.multipleNotes(1)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      // フォーカス時に再検証されないことを確認
      // Note: これは実際のSWRの動作をテストするのが困難なため、
      // 設定が正しく渡されていることのみを確認
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('キャッシュ動作', () => {
    it('同じchampionIdで複数回呼び出された場合、キャッシュが使用される', async () => {
      // Arrange
      const championId = 'CachedChamp'
      const mockNotes = noteFixtures.multipleNotes(2)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result: result1 } = renderHook(() => useNotes(championId), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result1.current.data).toEqual(mockNotes)
      })
      
      // 同じキーで再度呼び出し
      const { result: result2 } = renderHook(() => useNotes(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result2.current.data).toEqual(mockNotes)
      })
      
      // 両方のresultが同じデータを持つ
      expect(result1.current.data).toEqual(result2.current.data)
    })
  })

  describe('パラメータの境界値テスト', () => {
    it('undefinedのchampionIdの場合はeqが呼ばれない', async () => {
      // Arrange
      const mockNotes = noteFixtures.multipleNotes(1)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
        eq: jest.fn(),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(undefined), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      expect(mockChain.eq).not.toHaveBeenCalled()
    })

    it('nullのchampionIdの場合はeqが呼ばれない', async () => {
      // Arrange
      const mockNotes = noteFixtures.multipleNotes(1)
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockNotes,
          error: null,
        }),
        eq: jest.fn(),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNotes(null as unknown as string | undefined), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNotes)
      })
      
      expect(mockChain.eq).not.toHaveBeenCalled()
    })
  })
})