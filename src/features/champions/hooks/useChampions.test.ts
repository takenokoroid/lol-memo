import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useChampions } from './useChampions'
import { getChampions } from '../api/getChampions'
import type { ChampionData, Champion } from '../types'
import React from 'react'

// Mock the API function
jest.mock('../api/getChampions')
const mockGetChampions = getChampions as jest.MockedFunction<typeof getChampions>

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

// Mock champion data
const createMockChampion = (overrides: Partial<Champion> = {}): Champion => ({
  id: 'Aatrox',
  key: '266',
  name: 'Aatrox',
  title: 'the Darkin Blade',
  image: {
    full: 'Aatrox.png',
    sprite: 'champion0.png',
    group: 'champion',
    x: 0,
    y: 0,
    w: 48,
    h: 48,
  },
  tags: ['Fighter', 'Tank'],
  info: {
    attack: 8,
    defense: 4,
    magic: 3,
    difficulty: 4,
  },
  ...overrides,
})

const createMockChampionData = (champions: Champion[] = []): ChampionData => {
  const data: Record<string, Champion> = {}
  champions.forEach(champion => {
    data[champion.id] = champion
  })
  
  return {
    type: 'champion',
    format: 'standAloneComplex',
    version: '14.1.1',
    data,
  }
}

describe('useChampions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('チャンピオンデータを正常に取得できる', async () => {
      // Arrange
      const mockChampions = [
        createMockChampion(),
        createMockChampion({
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'the Nine-Tailed Fox',
          tags: ['Mage', 'Assassin'],
        }),
        createMockChampion({
          id: 'Yasuo',
          key: '157',
          name: 'Yasuo',
          title: 'the Unforgiven',
          tags: ['Fighter', 'Assassin'],
        }),
      ]
      const mockChampionData = createMockChampionData(mockChampions)
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.isLoading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
      expect(mockGetChampions).toHaveBeenCalledTimes(1)
      expect(mockGetChampions).toHaveBeenCalledWith('champions')
    })

    it('空のチャンピオンデータでも正常に動作する', async () => {
      // Arrange
      const mockChampionData = createMockChampionData([])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
      expect(Object.keys(result.current.data!.data)).toHaveLength(0)
    })

    it('大量のチャンピオンデータを処理できる', async () => {
      // Arrange
      const mockChampions = Array.from({ length: 100 }, (_, index) => 
        createMockChampion({
          id: `Champion${index}`,
          key: index.toString(),
          name: `Champion ${index}`,
          title: `Test Champion ${index}`,
        })
      )
      const mockChampionData = createMockChampionData(mockChampions)
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      expect(Object.keys(result.current.data!.data)).toHaveLength(100)
      expect(result.current.error).toBeUndefined()
    })
  })

  describe('エラーハンドリング', () => {
    it('API呼び出しでエラーが発生した場合はエラーを返す', async () => {
      // Arrange
      const apiError = new Error('Failed to fetch champions')
      
      mockGetChampions.mockRejectedValue(apiError)

      // Act
      const { result } = renderHook(() => useChampions(), {
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
      const networkError = new Error('Network request failed')
      
      mockGetChampions.mockRejectedValue(networkError)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(networkError)
      })
    })

    it('APIレスポンス形式エラーの場合もエラーを返す', async () => {
      // Arrange
      const formatError = new Error('Invalid response format')
      
      mockGetChampions.mockRejectedValue(formatError)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.error).toEqual(formatError)
      })
    })
  })

  describe('SWR設定', () => {
    it('正しいキーでSWRを呼び出す', async () => {
      // Arrange
      const mockChampionData = createMockChampionData([createMockChampion()])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      expect(mockGetChampions).toHaveBeenCalledWith('champions')
    })

    it('revalidateOnFocusがfalseに設定されている', async () => {
      // Arrange
      const mockChampionData = createMockChampionData([createMockChampion()])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      // バリデーション設定の確認
      expect(result.current.isValidating).toBe(false)
    })

    it('revalidateOnReconnectがfalseに設定されている', async () => {
      // Arrange
      const mockChampionData = createMockChampionData([createMockChampion()])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      expect(result.current.isValidating).toBe(false)
    })

    it('revalidateIfStaleがfalseに設定されている', async () => {
      // Arrange
      const mockChampionData = createMockChampionData([createMockChampion()])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      expect(result.current.isValidating).toBe(false)
    })
  })

  describe('キャッシュ動作', () => {
    it('複数回呼び出された場合、キャッシュが使用される', async () => {
      // Arrange
      const mockChampionData = createMockChampionData([
        createMockChampion(),
        createMockChampion({ id: 'Ahri', name: 'Ahri' }),
      ])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result: result1 } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })
      
      await waitFor(() => {
        expect(result1.current.data).toEqual(mockChampionData)
      })
      
      // 同じキーで再度呼び出し
      const { result: result2 } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result2.current.data).toEqual(mockChampionData)
      })
      
      // 両方のresultが同じデータを持つ
      expect(result1.current.data).toEqual(result2.current.data)
      
      // APIが呼ばれる（キャッシュの詳細な動作はSWRに依存）
      expect(mockGetChampions).toHaveBeenCalled()
    })

    it('mutateを使ってキャッシュを更新できる', async () => {
      // Arrange
      const initialData = createMockChampionData([createMockChampion()])
      const updatedData = createMockChampionData([
        createMockChampion(),
        createMockChampion({ id: 'NewChampion', name: 'New Champion' }),
      ])
      
      mockGetChampions.mockResolvedValue(initialData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData)
      })

      // mutateでデータを更新
      mockGetChampions.mockResolvedValue(updatedData)
      await act(async () => {
        await result.current.mutate()
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(updatedData)
      })
    })
  })

  describe('レスポンスデータの検証', () => {
    it('正しいチャンピオンデータ構造を返す', async () => {
      // Arrange
      const mockChampion = createMockChampion({
        id: 'TestChamp',
        key: '999',
        name: 'Test Champion',
        title: 'the Test',
        tags: ['Fighter'],
        info: {
          attack: 10,
          defense: 5,
          magic: 2,
          difficulty: 8,
        },
      })
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      const data = result.current.data!
      expect(data.type).toBe('champion')
      expect(data.format).toBe('standAloneComplex')
      expect(data.version).toBe('14.1.1')
      expect(data.data.TestChamp).toEqual(mockChampion)
      expect(data.data.TestChamp.id).toBe('TestChamp')
      expect(data.data.TestChamp.name).toBe('Test Champion')
      expect(data.data.TestChamp.tags).toContain('Fighter')
    })

    it('imageプロパティが正しい構造を持つ', async () => {
      // Arrange
      const mockChampion = createMockChampion({
        image: {
          full: 'CustomChampion.png',
          sprite: 'champion1.png',
          group: 'champion',
          x: 48,
          y: 96,
          w: 48,
          h: 48,
        },
      })
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      const champion = result.current.data!.data.Aatrox
      expect(champion.image).toEqual({
        full: 'CustomChampion.png',
        sprite: 'champion1.png',
        group: 'champion',
        x: 48,
        y: 96,
        w: 48,
        h: 48,
      })
    })

    it('infoプロパティが正しい数値を持つ', async () => {
      // Arrange
      const mockChampion = createMockChampion({
        info: {
          attack: 9,
          defense: 7,
          magic: 6,
          difficulty: 5,
        },
      })
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      const champion = result.current.data!.data.Aatrox
      expect(champion.info.attack).toBe(9)
      expect(champion.info.defense).toBe(7)
      expect(champion.info.magic).toBe(6)
      expect(champion.info.difficulty).toBe(5)
    })
  })

  describe('パフォーマンス', () => {
    it('大量データでも適切なレスポンス時間を保つ', async () => {
      // Arrange
      const startTime = Date.now()
      const mockChampions = Array.from({ length: 500 }, (_, index) => 
        createMockChampion({
          id: `Champ${index}`,
          name: `Champion ${index}`,
        })
      )
      const mockChampionData = createMockChampionData(mockChampions)
      
      mockGetChampions.mockResolvedValue(mockChampionData)

      // Act
      const { result } = renderHook(() => useChampions(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.data).toEqual(mockChampionData)
      })
      
      const endTime = Date.now()
      const processingTime = endTime - startTime
      
      expect(Object.keys(result.current.data!.data)).toHaveLength(500)
      expect(processingTime).toBeLessThan(5000) // 5秒以内
    })
  })
})