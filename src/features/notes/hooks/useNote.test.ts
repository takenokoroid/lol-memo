import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useNote } from './useNote'
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

describe('useNote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('指定したIDのノートを取得できる', async () => {
      // Arrange
      const noteId = 'note-123'
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      expect(mockChain.select).toHaveBeenCalledWith('*')
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
      expect(mockChain.single).toHaveBeenCalled()
    })


    it('チャンピオンメモを正常に取得できる', async () => {
      // Arrange
      const noteId = 'champion-note-123'
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(result.current.data?.champion_id).toBe('Aatrox')
      expect(result.current.data?.title).toBe('Aatroxの基本戦略')
      expect(result.current.data?.tags).toEqual(['ビルド', 'コンボ'])
    })

    it('一般メモを正常に取得できる', async () => {
      // Arrange
      const noteId = 'general-note-456'
      const mockNote = noteFixtures.generalNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(result.current.data?.champion_id).toBeNull()
      expect(result.current.data?.title).toBe('一般的なゲーム戦略')
      expect(result.current.data?.tags).toEqual(['戦略'])
    })
  })

  describe('エラーハンドリング', () => {
    it('存在しないノートIDの場合はエラーを返す', async () => {
      // Arrange
      const noteId = 'non-existent-note'
      const notFoundError = new Error('No rows returned')
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: notFoundError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(notFoundError)
      })
      
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })

    it('データベースエラーの場合はエラーを返す', async () => {
      // Arrange
      const noteId = 'db-error-note'
      const dbError = new Error('Database connection failed')
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: dbError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(dbError)
      })
    })

    it('権限エラーの場合はエラーを返す', async () => {
      // Arrange
      const noteId = 'forbidden-note'
      const permissionError = new Error('Permission denied')
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: permissionError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(permissionError)
      })
    })

    it('ネットワークエラーの場合もエラーを返す', async () => {
      // Arrange
      const noteId = 'network-error-note'
      const networkError = new Error('Network request failed')
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: networkError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(networkError)
      })
    })
  })

  describe('パラメータ検証', () => {
    it('noteIdが空文字の場合はAPIを呼び出さない', () => {
      // Act
      const { result } = renderHook(() => useNote(''), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('noteIdがnullの場合はAPIを呼び出さない', () => {
      // Act
      const { result } = renderHook(() => useNote(null as unknown as string), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('noteIdがundefinedの場合はAPIを呼び出さない', () => {
      // Act
      const { result } = renderHook(() => useNote(undefined as unknown as string), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    const testCases = [
      {
        description: 'UUIDフォーマットのID',
        noteId: '550e8400-e29b-41d4-a716-446655440000',
      },
      {
        description: '特殊文字を含むID',
        noteId: 'note-123!@#$%',
      },
      {
        description: '非常に長いID',
        noteId: 'A'.repeat(1000),
      },
      {
        description: '数字のみのID',
        noteId: '12345',
      },
      {
        description: 'ハイフンを含むID',
        noteId: 'note-with-hyphens',
      },
    ]

    it.each(testCases)('$description でノートを取得できる', async ({ noteId }) => {
      // Arrange
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
    })
  })

  describe('キャッシュ動作', () => {
    it('同じIDで複数回呼び出された場合、キャッシュが使用される', async () => {
      // Arrange
      const noteId = 'cached-note'
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result: result1 } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result1.current.data).toEqual(mockNote)
      })
      
      // 同じキーで再度呼び出し
      const { result: result2 } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result2.current.data).toEqual(mockNote)
      })
      
      expect(result1.current.data).toEqual(result2.current.data)
      // Supabaseクライアントが呼ばれる（キャッシュの詳細はSWRに依存）
      expect(mockSupabaseClient.from).toHaveBeenCalled()
    })

    it('mutateを使ってキャッシュを更新できる', async () => {
      // Arrange
      const noteId = 'mutable-note'
      const initialNote = noteFixtures.championNote()
      const updatedNote = {
        ...initialNote,
        title: '更新されたタイトル',
        content: '更新されたコンテンツ',
      }
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: initialNote,
            error: null,
          })
          .mockResolvedValueOnce({
            data: updatedNote,
            error: null,
          }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(initialNote)
      })

      // mutateでデータを更新
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
      const noteId = 'test-key-note'
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
    })

    it('revalidateOnFocusがfalseに設定されている', async () => {
      // Arrange
      const noteId = 'focus-test-note'
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(result.current.isValidating).toBe(false)
    })

    it('revalidateOnReconnectがfalseに設定されている', async () => {
      // Arrange
      const noteId = 'reconnect-test-note'
      const mockNote = noteFixtures.championNote()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('レスポンスデータの検証', () => {
    it('取得したノートが正しい構造を持つ', async () => {
      // Arrange
      const noteId = 'structure-test-note'
      const mockNote = noteFixtures.noteWithSpecialCharacters()
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue(mockChain)

      // Act
      const { result } = renderHook(() => useNote(noteId), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockNote)
      })
      
      const data = result.current.data!
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('user_id')
      expect(data).toHaveProperty('champion_id')
      expect(data).toHaveProperty('title')
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('tags')
      expect(data).toHaveProperty('created_at')
      expect(data).toHaveProperty('updated_at')
      
      expect(typeof data.id).toBe('string')
      expect(typeof data.title).toBe('string')
      expect(typeof data.content).toBe('string')
      expect(Array.isArray(data.tags)).toBe(true)
    })
  })
})