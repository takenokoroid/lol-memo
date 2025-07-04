import { createNote } from './createNote'
import { createMockCreateNoteRequest } from '@/__mocks__/fixtures/noteData'
import { userFixtures } from '@/__mocks__/fixtures/userData'

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

describe('createNote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('認証済みユーザーがメモを作成できる（champion_idなし）', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const noteRequest = createMockCreateNoteRequest({
        title: 'Test Note',
        content: 'Test content',
        champion_id: null,
        tags: ['test'],
      })
      const expectedNote = {
        id: 'note-123',
        user_id: mockUser.id,
        ...noteRequest,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      // Setup mocks
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await createNote(noteRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      
      const insertCall = mockSupabaseClient.from().insert
      expect(insertCall).toHaveBeenCalledWith({
        user_id: mockUser.id,
        ...noteRequest,
      })
    })

    it('チャンピオンメモが存在しない場合は新規作成する', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const noteRequest = createMockCreateNoteRequest({
        title: 'Test Note',
        content: 'Test content',
        champion_id: 'Aatrox',
        tags: ['test'],
      })
      const expectedNote = {
        id: 'note-123',
        user_id: mockUser.id,
        ...noteRequest,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      // Setup mocks
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      // Mock for checking existing note
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }
      
      // Mock for insert
      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
        insert: jest.fn().mockReturnValue(mockInsertChain),
      })

      // Act
      const result = await createNote(noteRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      
      // Verify select was called for checking existing note
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('id')
      expect(mockSelectChain.eq).toHaveBeenCalledWith('user_id', mockUser.id)
      expect(mockSelectChain.eq).toHaveBeenCalledWith('champion_id', 'Aatrox')
      
      // Verify insert was called
      const insertCall = mockSupabaseClient.from().insert
      expect(insertCall).toHaveBeenCalledWith({
        user_id: mockUser.id,
        ...noteRequest,
      })
    })

    it('チャンピオンメモが既に存在する場合は更新する', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const existingNoteId = 'existing-note-123'
      const noteRequest = createMockCreateNoteRequest({
        title: 'Updated Note',
        content: 'Updated content',
        champion_id: 'Aatrox',
        tags: ['updated'],
      })
      const expectedNote = {
        id: existingNoteId,
        user_id: mockUser.id,
        ...noteRequest,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      // Setup mocks
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      // Mock for checking existing note
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: existingNoteId },
          error: null,
        }),
      }
      
      // Mock for update
      const mockUpdateChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
        update: jest.fn().mockReturnValue(mockUpdateChain),
      })

      // Act
      const result = await createNote(noteRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('notes')
      
      // Verify select was called for checking existing note
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('id')
      expect(mockSelectChain.eq).toHaveBeenCalledWith('user_id', mockUser.id)
      expect(mockSelectChain.eq).toHaveBeenCalledWith('champion_id', 'Aatrox')
      
      // Verify update was called instead of insert
      const updateCall = mockSupabaseClient.from().update
      expect(updateCall).toHaveBeenCalledWith({
        ...noteRequest,
        updated_at: expect.any(String),
      })
      expect(mockUpdateChain.eq).toHaveBeenCalledWith('id', existingNoteId)
    })

    it('チャンピオンIDなしでメモを作成できる', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const noteRequest = createMockCreateNoteRequest({
        title: 'General Note',
        content: 'General content',
        champion_id: null,
      })
      const expectedNote = {
        id: 'note-456',
        user_id: mockUser.id,
        ...noteRequest,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      // Setup mocks
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: expectedNote,
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockChain),
      })

      // Act
      const result = await createNote(noteRequest)

      // Assert
      expect(result).toEqual(expectedNote)
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        ...noteRequest,
      })
    })

    it('空のタグ配列でメモを作成できる', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const noteRequest = createMockCreateNoteRequest({
        tags: [],
        champion_id: 'Aatrox',
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      // Mock for checking existing note
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }
      
      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'note-789', user_id: mockUser.id, ...noteRequest },
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
        insert: jest.fn().mockReturnValue(mockInsertChain),
      })

      // Act
      await createNote(noteRequest)

      // Assert
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        ...noteRequest,
      })
    })
  })

  describe('異常系', () => {
    it('未認証ユーザーの場合はエラーを投げる', async () => {
      // Arrange
      const noteRequest = createMockCreateNoteRequest()

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Act & Assert
      await expect(createNote(noteRequest)).rejects.toThrow('ユーザーが認証されていません')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const noteRequest = createMockCreateNoteRequest({ champion_id: null }) // champion_idなしでテスト
      const supabaseError = new Error('Database connection failed')

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: supabaseError,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockChain),
      })

      // Act & Assert
      await expect(createNote(noteRequest)).rejects.toThrow('Database connection failed')
    })

    it('認証取得でエラーが発生した場合はエラーを投げる', async () => {
      // Arrange
      const noteRequest = createMockCreateNoteRequest({ champion_id: null })
      const authError = new Error('Auth service unavailable')

      mockSupabaseClient.auth.getUser.mockRejectedValue(authError)

      // Act & Assert
      await expect(createNote(noteRequest)).rejects.toThrow('Auth service unavailable')
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })
  })

  describe('境界値テスト', () => {
    const testCases = [
      {
        description: '最小限の必須項目でメモを作成',
        input: { title: 'A', content: 'B' },
      },
      {
        description: '長いタイトルと内容でメモを作成',
        input: { 
          title: 'A'.repeat(200), 
          content: 'B'.repeat(5000),
          tags: Array.from({ length: 10 }, (_, i) => `tag${i}`),
        },
      },
      {
        description: '特殊文字を含むメモを作成',
        input: { 
          title: 'Title with "quotes" & symbols!', 
          content: 'Content with <HTML> & entities',
          tags: ['tag-with-dash', 'tag@symbol'],
        },
      },
    ]

    it.each(testCases)('$description', async ({ input }) => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const noteRequest = createMockCreateNoteRequest(input)

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      // Mock for checking existing note (if champion_id is present)
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }
      
      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'note-test', user_id: mockUser.id, ...noteRequest },
          error: null,
        }),
      }
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockSelectChain),
        insert: jest.fn().mockReturnValue(mockInsertChain),
      })

      // Act
      const result = await createNote(noteRequest)

      // Assert
      expect(result).toHaveProperty('id')
      expect(result.user_id).toBe(mockUser.id)
      expect(result.title).toBe(noteRequest.title)
      expect(result.content).toBe(noteRequest.content)
    })
  })
})