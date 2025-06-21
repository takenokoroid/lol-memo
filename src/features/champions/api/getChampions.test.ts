import { getChampions } from './getChampions'
import { championFixtures } from '@/__mocks__/fixtures/championData'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('getChampions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('チャンピオンデータを正常に取得できる', async () => {
      // Arrange
      const mockChampionData = {
        type: 'champion',
        format: 'standAloneComplex', 
        version: '14.24.1',
        data: championFixtures.multipleChampions(3),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChampionData,
      })

      // Act
      const result = await getChampions()

      // Assert
      expect(result).toEqual(mockChampionData)
      expect(result.type).toBe('champion')
      expect(result.version).toBe('14.24.1')
      expect(Object.keys(result.data)).toHaveLength(3)
      
      // Verify structure of returned champions
      const champions = Object.values(result.data)
      champions.forEach(champion => {
        expect(champion).toHaveProperty('id')
        expect(champion).toHaveProperty('name')
        expect(champion).toHaveProperty('title')
        expect(champion).toHaveProperty('image')
        expect(champion).toHaveProperty('tags')
        expect(champion).toHaveProperty('info')
        expect(Array.isArray(champion.tags)).toBe(true)
        expect(typeof champion.info.attack).toBe('number')
        expect(typeof champion.info.defense).toBe('number')
        expect(typeof champion.info.magic).toBe('number')
        expect(typeof champion.info.difficulty).toBe('number')
      })
    })

    it('空のチャンピオンデータでも正常にレスポンスを処理できる', async () => {
      // Arrange
      const emptyChampionData = {
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.24.1',
        data: {},
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyChampionData,
      })

      // Act
      const result = await getChampions()

      // Assert
      expect(result).toEqual(emptyChampionData)
      expect(Object.keys(result.data)).toHaveLength(0)
    })

    it('大量のチャンピオンデータを処理できる', async () => {
      // Arrange
      const largeChampionData = {
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.24.1',
        data: championFixtures.multipleChampions(50),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => largeChampionData,
      })

      // Act
      const result = await getChampions()

      // Assert
      expect(result).toEqual(largeChampionData)
      expect(Object.keys(result.data)).toHaveLength(50)
    })
  })

  describe('異常系', () => {
    it('APIが404を返した場合はエラーを投げる', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      })

      // Act & Assert
      await expect(getChampions()).rejects.toThrow('Failed to fetch champions: 404')
    })

    it('APIが500を返した場合はエラーを投げる', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      // Act & Assert
      await expect(getChampions()).rejects.toThrow('Failed to fetch champions: 500')
    })

    it('ネットワークエラーの場合はエラーを投げる', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      // Act & Assert
      await expect(getChampions()).rejects.toThrow()
    })

    it('不正なJSONレスポンスの場合はエラーを投げる', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Unexpected token i in JSON at position 0')),
      })

      // Act & Assert
      await expect(getChampions()).rejects.toThrow()
    })
  })

  describe('エッジケース', () => {
    it('特殊文字を含むチャンピオン名を正しく処理できる', async () => {
      // Arrange
      const specialChampion = championFixtures.withSpecialCharacters()
      const championData = {
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.24.1',
        data: {
          [specialChampion.id]: specialChampion,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => championData,
      })

      // Act
      const result = await getChampions()

      // Assert
      expect(result.data[specialChampion.id].name).toBe("Kai'Sa")
      expect(result.data[specialChampion.id].title).toBe('Daughter of the Void')
    })

    it('非常に長い名前のチャンピオンを処理できる', async () => {
      // Arrange
      const longNameChampion = championFixtures.withLongName()
      const championData = {
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.24.1',
        data: {
          [longNameChampion.id]: longNameChampion,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => championData,
      })

      // Act
      const result = await getChampions()

      // Assert
      expect(result.data[longNameChampion.id].name).toContain('Very Long Champion Name')
      expect(result.data[longNameChampion.id].title).toContain('Extremely Long Title')
    })
  })

  describe('レスポンス時間', () => {
    it('遅延がある場合でも正常にレスポンスを処理できる', async () => {
      // Arrange
      const championData = {
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.24.1',
        data: championFixtures.multipleChampions(1),
      }

      mockFetch.mockImplementationOnce(async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
          ok: true,
          json: async () => championData,
        }
      })

      // Act
      const startTime = Date.now()
      const result = await getChampions()
      const endTime = Date.now()

      // Assert
      expect(result).toEqual(championData)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
    }, 10000) // 10 second timeout for this test
  })
})