import { updateNote } from './updateNote'
import { createMockUpdateNoteRequest } from '@/__mocks__/fixtures/noteData'

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

describe('updateNote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('メモを正常に更新できる', async () => {
      // Arrange
      const noteId = 'note-123'
      const updateRequest = createMockUpdateNoteRequest({
        title: 'Updated Title',
        content: 'Updated content',
        tags: ['updated', 'test'],
      })
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'Aatrox',
        title: 'Updated Title',
        content: 'Updated content',
        tags: ['updated', 'test'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
      expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
      expect(mockChain.select).toHaveBeenCalled()
      expect(mockChain.single).toHaveBeenCalled()
    })

    it('部分更新（タイトルのみ）ができる', async () => {
      // Arrange
      const noteId = 'note-456'
      const updateRequest = createMockUpdateNoteRequest({
        title: 'New Title Only',
      })
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'Ahri',
        title: 'New Title Only',
        content: 'Original content remains',
        tags: ['original', 'tags'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
    })

    it('部分更新（コンテンツのみ）ができる', async () => {
      // Arrange
      const noteId = 'note-789'
      const updateRequest = createMockUpdateNoteRequest({
        content: 'Updated content only',
      })
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'Jinx',
        title: 'Original Title',
        content: 'Updated content only',
        tags: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
    })

    it('部分更新（タグのみ）ができる', async () => {
      // Arrange
      const noteId = 'note-101'
      const updateRequest = createMockUpdateNoteRequest({
        tags: ['new', 'tags', 'only'],
      })
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'Zed',
        title: 'Original Title',
        content: 'Original content',
        tags: ['new', 'tags', 'only'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
    })

    it('チャンピオンIDを変更できる', async () => {
      // Arrange
      const noteId = 'note-202'
      const updateRequest = createMockUpdateNoteRequest({
        champion_id: 'Yasuo',
        title: 'Moved to Yasuo',
      })
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'Yasuo',
        title: 'Moved to Yasuo',
        content: 'Original content',
        tags: ['mid'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
    })

    it('空のタグ配列で更新できる', async () => {
      // Arrange
      const noteId = 'note-303'
      const updateRequest = createMockUpdateNoteRequest({
        tags: [],
      })
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'Akali',
        title: 'Original Title',
        content: 'Original content',
        tags: [],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
    })
  })

  describe('異常系', () => {
    it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
      // Arrange
      const noteId = 'note-error'
      const updateRequest = createMockUpdateNoteRequest({
        title: 'This will fail',
      })
      const supabaseError = new Error('Database connection failed')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: supabaseError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(updateNote(noteId, updateRequest)).rejects.toThrow('Database connection failed')
    })

    it('メモが見つからない場合はエラーを投げる', async () => {
      // Arrange
      const noteId = 'non-existent-note'
      const updateRequest = createMockUpdateNoteRequest({
        title: 'Update non-existent',
      })
      const notFoundError = new Error('No rows returned')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: notFoundError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(updateNote(noteId, updateRequest)).rejects.toThrow('No rows returned')
    })

    it('無効なIDの場合はエラーを投げる', async () => {
      // Arrange
      const noteId = ''
      const updateRequest = createMockUpdateNoteRequest({
        title: 'Invalid ID',
      })
      const validationError = new Error('Invalid ID format')

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: validationError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(updateNote(noteId, updateRequest)).rejects.toThrow('Invalid ID format')
    })
  })

  describe('境界値テスト', () => {
    const testCases = [
      {
        description: '空の更新オブジェクトで更新',
        input: {},
        noteId: 'note-empty',
      },
      {
        description: '長いタイトルで更新',
        input: { title: 'A'.repeat(200) },
        noteId: 'note-long-title',
      },
      {
        description: '長いコンテンツで更新',
        input: { content: 'B'.repeat(5000) },
        noteId: 'note-long-content',
      },
      {
        description: '多数のタグで更新',
        input: { tags: Array.from({ length: 20 }, (_, i) => `tag${i}`) },
        noteId: 'note-many-tags',
      },
      {
        description: '特殊文字を含む内容で更新',
        input: {
          title: 'Title with "quotes" & <HTML>',
          content: 'Content with 特殊文字 and emojis 🎮',
          tags: ['tag-with-dash', 'tag@symbol', 'tag#hash'],
        },
        noteId: 'note-special-chars',
      },
    ]

    it.each(testCases)('$description', async ({ input, noteId }) => {
      // Arrange
      const updateRequest = createMockUpdateNoteRequest(input)
      const expectedNote = {
        id: noteId,
        user_id: 'user-123',
        champion_id: 'TestChamp',
        title: input.title || 'Original Title',
        content: input.content || 'Original Content',
        tags: input.tags || ['original'],
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      const mockChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await updateNote(noteId, updateRequest)

      // Assert
      expect(result).toHaveProperty('id', noteId)
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateRequest)
    })
  })
})