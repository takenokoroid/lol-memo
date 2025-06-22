import {
  getMatchupNotes,
  getMatchupNote,
  createMatchupNote,
  updateMatchupNote,
  deleteMatchupNote,
  upsertMatchupNote,
} from './matchupNotes'
import { createMockCreateMatchupNoteRequest, createMockMatchupNote } from '@/__mocks__/fixtures/noteData'
import { userFixtures } from '@/__mocks__/fixtures/userData'
import type { UpdateMatchupNoteRequest } from '../types'

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

describe('matchupNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMatchupNotes', () => {
    describe('正常系', () => {
      it('指定したチャンピオンの対面メモ一覧を取得できる', async () => {
        // Arrange
        const championId = 'Aatrox'
        const expectedNotes = [
          createMockMatchupNote({ 
            id: 'matchup-1', 
            champion_id: championId, 
            opponent_id: 'Renekton',
            content: 'レネクトン対面の戦略',
          }),
          createMockMatchupNote({ 
            id: 'matchup-2', 
            champion_id: championId, 
            opponent_id: 'Riven',
            content: 'リヴェン対面の戦略',
          }),
        ]

        // Setup mocks
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: expectedNotes,
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await getMatchupNotes(championId)

        // Assert
        expect(result).toEqual(expectedNotes)
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('matchup_notes')
        expect(mockChain.select).toHaveBeenCalledWith('*')
        expect(mockChain.eq).toHaveBeenCalledWith('champion_id', championId)
        expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      })

      it('対面メモが存在しない場合は空配列を返す', async () => {
        // Arrange
        const championId = 'Yasuo'

        // Setup mocks
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await getMatchupNotes(championId)

        // Assert
        expect(result).toEqual([])
      })
    })

    describe('異常系', () => {
      it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
        // Arrange
        const championId = 'ErrorChamp'
        const supabaseError = new Error('Database connection failed')

        // Setup mocks
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: null,
            error: supabaseError,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act & Assert
        await expect(getMatchupNotes(championId)).rejects.toThrow('Database connection failed')
      })
    })
  })

  describe('getMatchupNote', () => {
    describe('正常系', () => {
      it('指定したチャンピオンと対戦相手の対面メモを取得できる', async () => {
        // Arrange
        const championId = 'Aatrox'
        const opponentId = 'Renekton'
        const expectedNote = createMockMatchupNote({
          id: 'matchup-1',
          champion_id: championId,
          opponent_id: opponentId,
          content: 'レネクトン対面は序盤不利',
        })

        // Setup mocks
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: expectedNote,
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await getMatchupNote(championId, opponentId)

        // Assert
        expect(result).toEqual(expectedNote)
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('matchup_notes')
        expect(mockChain.eq).toHaveBeenCalledWith('champion_id', championId)
        expect(mockChain.eq).toHaveBeenCalledWith('opponent_id', opponentId)
        expect(mockChain.single).toHaveBeenCalled()
      })

      it('対面メモが存在しない場合はnullを返す', async () => {
        // Arrange
        const championId = 'Yasuo'
        const opponentId = 'Zed'

        // Setup mocks
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await getMatchupNote(championId, opponentId)

        // Assert
        expect(result).toBeNull()
      })
    })

    describe('異常系', () => {
      it('PGRST116以外のエラーの場合はエラーを投げる', async () => {
        // Arrange
        const championId = 'ErrorChamp'
        const opponentId = 'ErrorOpponent'
        const supabaseError = { code: 'PGRST001', message: 'Connection error' }

        // Setup mocks
        const mockChain = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: supabaseError,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act & Assert
        await expect(getMatchupNote(championId, opponentId)).rejects.toEqual(supabaseError)
      })
    })
  })

  describe('createMatchupNote', () => {
    describe('正常系', () => {
      it('認証済みユーザーが対面メモを作成できる', async () => {
        // Arrange
        const mockUser = userFixtures.authenticatedUser()
        const noteRequest = createMockCreateMatchupNoteRequest({
          champion_id: 'Aatrox',
          opponent_id: 'Renekton',
          content: 'レネクトン対面の戦略メモ',
        })
        const expectedNote = createMockMatchupNote({
          id: 'matchup-123',
          user_id: mockUser.id,
          ...noteRequest,
        })

        // Setup mocks
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })
        
        const mockChain = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: expectedNote,
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await createMatchupNote(noteRequest)

        // Assert
        expect(result).toEqual(expectedNote)
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('matchup_notes')
        expect(mockChain.insert).toHaveBeenCalledWith({
          user_id: mockUser.id,
          ...noteRequest,
        })
      })
    })

    describe('異常系', () => {
      it('未認証ユーザーの場合はエラーを投げる', async () => {
        // Arrange
        const noteRequest = createMockCreateMatchupNoteRequest()

        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        // Act & Assert
        await expect(createMatchupNote(noteRequest)).rejects.toThrow('ユーザーが認証されていません')
        expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      })

      it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
        // Arrange
        const mockUser = userFixtures.authenticatedUser()
        const noteRequest = createMockCreateMatchupNoteRequest()
        const supabaseError = new Error('Insert failed')

        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })
        
        const mockChain = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: supabaseError,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act & Assert
        await expect(createMatchupNote(noteRequest)).rejects.toThrow('Insert failed')
      })
    })
  })

  describe('updateMatchupNote', () => {
    describe('正常系', () => {
      it('対面メモを正常に更新できる', async () => {
        // Arrange
        const noteId = 'matchup-123'
        const updates: UpdateMatchupNoteRequest = {
          content: '更新されたコンテンツ',
        }
        const expectedNote = createMockMatchupNote({
          id: noteId,
          content: updates.content,
        })

        // Setup mocks
        const mockChain = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: expectedNote,
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await updateMatchupNote(noteId, updates)

        // Assert
        expect(result).toEqual(expectedNote)
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('matchup_notes')
        expect(mockChain.update).toHaveBeenCalledWith(updates)
        expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
      })
    })

    describe('異常系', () => {
      it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
        // Arrange
        const noteId = 'matchup-error'
        const updates: UpdateMatchupNoteRequest = { content: 'Error content' }
        const supabaseError = new Error('Update failed')

        // Setup mocks
        const mockChain = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: supabaseError,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act & Assert
        await expect(updateMatchupNote(noteId, updates)).rejects.toThrow('Update failed')
      })
    })
  })

  describe('deleteMatchupNote', () => {
    describe('正常系', () => {
      it('対面メモを正常に削除できる', async () => {
        // Arrange
        const noteId = 'matchup-123'

        // Setup mocks
        const mockChain = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        await deleteMatchupNote(noteId)

        // Assert
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('matchup_notes')
        expect(mockChain.delete).toHaveBeenCalled()
        expect(mockChain.eq).toHaveBeenCalledWith('id', noteId)
      })
    })

    describe('異常系', () => {
      it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
        // Arrange
        const noteId = 'matchup-error'
        const supabaseError = new Error('Delete failed')

        // Setup mocks
        const mockChain = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            error: supabaseError,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act & Assert
        await expect(deleteMatchupNote(noteId)).rejects.toThrow('Delete failed')
      })
    })
  })

  describe('upsertMatchupNote', () => {
    describe('正常系', () => {
      it('認証済みユーザーが対面メモをupsertできる（新規作成）', async () => {
        // Arrange
        const mockUser = userFixtures.authenticatedUser()
        const championId = 'Aatrox'
        const opponentId = 'Renekton'
        const content = 'レネクトン対面のupsertメモ'
        const expectedNote = createMockMatchupNote({
          id: 'matchup-upsert-123',
          user_id: mockUser.id,
          champion_id: championId,
          opponent_id: opponentId,
          content,
        })

        // Setup mocks
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })
        
        const mockChain = {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: expectedNote,
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await upsertMatchupNote(championId, opponentId, content)

        // Assert
        expect(result).toEqual(expectedNote)
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('matchup_notes')
        expect(mockChain.upsert).toHaveBeenCalledWith({
          user_id: mockUser.id,
          champion_id: championId,
          opponent_id: opponentId,
          content,
        })
      })

      it('認証済みユーザーが対面メモをupsertできる（更新）', async () => {
        // Arrange
        const mockUser = userFixtures.authenticatedUser()
        const championId = 'Yasuo'
        const opponentId = 'Zed'
        const content = 'ゼド対面の更新されたメモ'
        const expectedNote = createMockMatchupNote({
          id: 'matchup-existing-456',
          user_id: mockUser.id,
          champion_id: championId,
          opponent_id: opponentId,
          content,
        })

        // Setup mocks
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })
        
        const mockChain = {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: expectedNote,
            error: null,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act
        const result = await upsertMatchupNote(championId, opponentId, content)

        // Assert
        expect(result).toEqual(expectedNote)
        expect(mockChain.upsert).toHaveBeenCalledWith({
          user_id: mockUser.id,
          champion_id: championId,
          opponent_id: opponentId,
          content,
        })
      })
    })

    describe('異常系', () => {
      it('未認証ユーザーの場合はエラーを投げる', async () => {
        // Arrange
        const championId = 'Aatrox'
        const opponentId = 'Renekton'
        const content = 'Unauthorized content'

        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        })

        // Act & Assert
        await expect(upsertMatchupNote(championId, opponentId, content)).rejects.toThrow('ユーザーが認証されていません')
        expect(mockSupabaseClient.from).not.toHaveBeenCalled()
      })

      it('Supabaseでエラーが発生した場合はエラーを投げる', async () => {
        // Arrange
        const mockUser = userFixtures.authenticatedUser()
        const championId = 'ErrorChamp'
        const opponentId = 'ErrorOpponent'
        const content = 'Error content'
        const supabaseError = new Error('Upsert failed')

        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        })
        
        const mockChain = {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: supabaseError,
          }),
        }
        
        mockSupabaseClient.from.mockReturnValue(mockChain)

        // Act & Assert
        await expect(upsertMatchupNote(championId, opponentId, content)).rejects.toThrow('Upsert failed')
      })
    })
  })
})