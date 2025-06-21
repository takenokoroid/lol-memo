import { faker } from '@faker-js/faker'
import type { Champion } from '@/features/champions/types'

export const createMockChampion = (overrides: Partial<Champion> = {}): Champion => ({
  id: faker.string.alphanumeric(8),
  key: faker.number.int({ min: 1, max: 200 }).toString(),
  name: faker.person.firstName(),
  title: faker.lorem.words(3),
  image: {
    full: `${faker.string.alphanumeric(8)}.png`,
    sprite: 'champion0.png',
    group: 'champion',
    x: faker.number.int({ min: 0, max: 512 }),
    y: faker.number.int({ min: 0, max: 512 }),
    w: 48,
    h: 48,
  },
  tags: faker.helpers.arrayElements(['Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'], {
    min: 1,
    max: 2,
  }),
  info: {
    attack: faker.number.int({ min: 1, max: 10 }),
    defense: faker.number.int({ min: 1, max: 10 }),
    magic: faker.number.int({ min: 1, max: 10 }),
    difficulty: faker.number.int({ min: 1, max: 10 }),
  },
  ...overrides,
})

export const championFixtures = {
  // Specific champions for consistent testing
  aatrox: (): Champion => createMockChampion({
    id: 'Aatrox',
    name: 'Aatrox',
    title: 'ザ・ダークイン・ブレード',
    tags: ['Fighter', 'Tank'],
    info: {
      attack: 8,
      defense: 4,
      magic: 3,
      difficulty: 4,
    },
  }),

  
  annie: (): Champion => createMockChampion({
    id: 'Annie',
    name: 'Annie',
    title: 'ザ・ダーク・チャイルド',
    tags: ['Mage'],
    info: {
      attack: 2,
      defense: 3,
      magic: 10,
      difficulty: 2,
    },
  }),

  jinx: (): Champion => createMockChampion({
    id: 'Jinx',
    name: 'Jinx',
    title: 'ザ・ルースキャノン',
    tags: ['Marksman'],
    info: {
      attack: 9,
      defense: 2,
      magic: 4,
      difficulty: 6,
    },
  }),

  // Generate multiple champions for list testing
  multipleChampions: (count: number = 3): Record<string, Champion> => {
    const champions = [
      championFixtures.aatrox(),
      championFixtures.annie(),
      championFixtures.jinx(),
    ]

    // Add more random champions if needed
    for (let i = champions.length; i < count; i++) {
      champions.push(createMockChampion())
    }

    return champions.reduce((acc, champion) => {
      acc[champion.id] = champion
      return acc
    }, {} as Record<string, Champion>)
  },

  // Random champion for property-based testing
  random: (): Champion => createMockChampion(),

  // Champion with specific properties for edge case testing
  withLongName: (): Champion => createMockChampion({
    name: 'Very Long Champion Name That Might Break UI',
    title: 'The Champion With An Extremely Long Title That Could Cause Layout Issues',
  }),

  withSpecialCharacters: (): Champion => createMockChampion({
    name: "Kai'Sa",
    title: 'Daughter of the Void',
  }),
}