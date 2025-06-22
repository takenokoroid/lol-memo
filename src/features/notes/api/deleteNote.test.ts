import { deleteNote } from './deleteNote'

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

describe('deleteNote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('メモを正常に削除できる', async () => {
      // Arrange
      const noteId = 'note-123'

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      await deleteNote(noteId)

      // Assert
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled()
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
    })

    it('異なるIDでメモを削除できる', async () => {
      // Arrange
      const noteId = 'note-456'

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      await deleteNote(noteId)

      // Assert
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
    })

    it('UUIDフォーマットのIDで削除できる', async () => {
      // Arrange
      const noteId = '550e8400-e29b-41d4-a716-446655440000'

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      await deleteNote(noteId)

      // Assert
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
    })
  })

  describe('異常系', () => {
    it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
      // Arrange
      const noteId = 'note-error'
      const supabaseError = new Error('Database connection failed')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: supabaseError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(deleteNote(noteId)).rejects.toThrow('Database connection failed')
    })

    it('メモが見つからない場合もエラーを投げる', async () => {
      // Arrange
      const noteId = 'non-existent-note'
      const notFoundError = new Error('No rows found')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: notFoundError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(deleteNote(noteId)).rejects.toThrow('No rows found')
    })

    it('権限エラーの場合はエラーを投げる', async () => {
      // Arrange
      const noteId = 'note-forbidden'
      const permissionError = new Error('Permission denied')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: permissionError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(deleteNote(noteId)).rejects.toThrow('Permission denied')
    })

    it('ネットワークエラーの場合はエラーを投げる', async () => {
      // Arrange
      const noteId = 'note-network-error'
      const networkError = new Error('Network request failed')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: networkError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(deleteNote(noteId)).rejects.toThrow('Network request failed')
    })
  })

  describe('境界値テスト', () => {
    const testCases = [
      {
        description: '空文字のIDで削除を試みる',
        noteId: '',
        expectedError: 'Invalid ID',
      },
      {
        description: '特殊文字を含むIDで削除を試みる',
        noteId: 'note-123!@#$%',
        expectedError: 'Invalid ID format',
      },
      {
        description: '非常に長いIDで削除を試みる',
        noteId: 'a'.repeat(1000),
        expectedError: 'ID too long',
      },
    ]

    it.each(testCases)('$description', async ({ noteId, expectedError }) => {
      // Arrange
      const validationError = new Error(expectedError)

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: validationError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(deleteNote(noteId)).rejects.toThrow(expectedError)
    })
  })

  describe('リトライとタイムアウト', () => {
    it('削除操作がタイムアウトした場合はエラーを投げる', async () => {
      // Arrange
      const noteId = 'note-timeout'
      const timeoutError = new Error('Request timeout')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: timeoutError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(deleteNote(noteId)).rejects.toThrow('Request timeout')
    })
  })

  describe('削除の副作用', () => {
    it('削除操作は一度だけ実行される', async () => {
      // Arrange
      const noteId = 'note-once'

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }
      
      const mockDelete = jest.fn().mockReturnValue(mockChain)
      
      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete,
      })

      // Act
      await deleteNote(noteId)

      // Assert
      expect(mockDelete).toHaveBeenCalledTimes(1)
      expect(mockChain.eq).toHaveBeenCalledTimes(1)
    })

    it('削除後は結果を返さない（void）', async () => {
      // Arrange
      const noteId = 'note-void'

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await deleteNote(noteId)

      // Assert
      expect(result).toBeUndefined()
    })
  })
})