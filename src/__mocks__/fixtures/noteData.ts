import { faker } from '@faker-js/faker'
import type { Note, MatchupNote, CreateNoteRequest, CreateMatchupNoteRequest } from '@/features/notes/types'

export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  champion_id: faker.helpers.maybe(() => faker.string.alphanumeric(8), { probability: 0.8 }),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  content: faker.lorem.paragraphs({ min: 1, max: 3 }),
  tags: faker.helpers.maybe(() => 
    faker.helpers.arrayElements(['ビルド', 'コンボ', '対面', 'ガンク', 'レーン'], {
      min: 0,
      max: 3,
    }), 
    { probability: 0.7 }
  ),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const createMockMatchupNote = (overrides: Partial<MatchupNote> = {}): MatchupNote => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  champion_id: faker.string.alphanumeric(8),
  opponent_id: faker.string.alphanumeric(8),
  content: faker.lorem.paragraphs({ min: 1, max: 2 }),
  created_at: faker.date.recent().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  ...overrides,
})

export const createMockCreateNoteRequest = (overrides: Partial<CreateNoteRequest> = {}): CreateNoteRequest => ({
  champion_id: faker.helpers.maybe(() => faker.string.alphanumeric(8), { probability: 0.8 }),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  content: faker.lorem.paragraphs({ min: 1, max: 3 }),
  tags: faker.helpers.maybe(() => 
    faker.helpers.arrayElements(['ビルド', 'コンボ', '対面'], { min: 1, max: 2 }), 
    { probability: 0.7 }
  ),
  ...overrides,
})

export const createMockCreateMatchupNoteRequest = (overrides: Partial<CreateMatchupNoteRequest> = {}): CreateMatchupNoteRequest => ({
  champion_id: faker.string.alphanumeric(8),
  opponent_id: faker.string.alphanumeric(8),
  content: faker.lorem.paragraphs({ min: 1, max: 2 }),
  ...overrides,
})

export const noteFixtures = {
  // Standard note for consistent testing
  championNote: (): Note => createMockNote({
    id: 'note-1',
    champion_id: 'Aatrox',
    title: 'Aatroxの基本戦略',
    content: 'ショートトレード意識\nボーンアーマー積むと良い\nレベル6でオールイン強い',
    tags: ['ビルド', 'コンボ'],
  }),

  generalNote: (): Note => createMockNote({
    id: 'note-2',
    champion_id: null,
    title: '一般的なゲーム戦略',
    content: 'ワード配置を意識する\nオブジェクト周りでのファイト',
    tags: ['戦略'],
  }),

  // Multiple notes for list testing
  multipleNotes: (count: number = 5): Note[] => {
    return Array.from({ length: count }, (_, index) => 
      createMockNote({
        id: `note-${index + 1}`,
        title: `Test Note ${index + 1}`,
      })
    )
  },

  // Matchup note for Aatrox vs Renekton
  aatroxVsRenekton: (): MatchupNote => createMockMatchupNote({
    id: 'matchup-1',
    champion_id: 'Aatrox',
    opponent_id: 'Renekton',
    content: 'レベル11まではレネク有利\nアイテム完成後は五分\nショートトレード推奨',
  }),

  // Multiple matchup notes
  multipleMatchupNotes: (championId: string, count: number = 3): MatchupNote[] => {
    const opponents = ['Renekton', 'Riven', 'Fiora', 'Jax', 'Camille']
    return Array.from({ length: count }, (_, index) => 
      createMockMatchupNote({
        id: `matchup-${index + 1}`,
        champion_id: championId,
        opponent_id: opponents[index % opponents.length],
      })
    )
  },

  // Edge cases
  emptyNote: (): Note => createMockNote({
    title: '',
    content: '',
    tags: [],
  }),

  longNote: (): Note => createMockNote({
    title: faker.lorem.sentence({ min: 20, max: 30 }),
    content: faker.lorem.paragraphs({ min: 10, max: 15 }),
    tags: faker.helpers.arrayElements(['ビルド', 'コンボ', '対面', 'ガンク', 'レーン'], {
      min: 5,
      max: 5,
    }),
  }),

  noteWithSpecialCharacters: (): Note => createMockNote({
    title: 'Test Note with "quotes" & special chars!',
    content: 'Content with <HTML> tags and & symbols',
    tags: ['test-tag', 'special@char'],
  }),
}