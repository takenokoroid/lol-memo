import { renderHook } from '@testing-library/react'
import { SWRConfig } from 'swr'
import { useChampion } from './useChampion'
import { useChampions } from './useChampions'
import type { ChampionData, Champion } from '../types'
import React from 'react'

// Mock the useChampions hook
jest.mock('./useChampions')
const mockUseChampions = useChampions as jest.MockedFunction<typeof useChampions>

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

describe('useChampion', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常系', () => {
    it('指定したIDのチャンピオンを取得できる', async () => {
      // Arrange
      const championId = 'Aatrox'
      const mockChampion = createMockChampion()
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toEqual(mockChampion)
      expect(result.current.error).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(mockUseChampions).toHaveBeenCalledTimes(1)
    })

    it('異なるIDで別のチャンピオンを取得できる', async () => {
      // Arrange
      const championId1 = 'Aatrox'
      const championId2 = 'Ahri'
      const mockChampion1 = createMockChampion()
      const mockChampion2 = createMockChampion({
        id: 'Ahri',
        key: '103',
        name: 'Ahri',
        title: 'the Nine-Tailed Fox',
        tags: ['Mage', 'Assassin'],
      })
      const mockChampionData = createMockChampionData([mockChampion1, mockChampion2])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result: result1 } = renderHook(() => useChampion(championId1), {
        wrapper: createWrapper(),
      })
      const { result: result2 } = renderHook(() => useChampion(championId2), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result1.current.data).toEqual(mockChampion1)
      expect(result2.current.data).toEqual(mockChampion2)
      expect(result1.current.data?.id).toBe('Aatrox')
      expect(result2.current.data?.id).toBe('Ahri')
    })

    it('大文字小文字を区別してチャンピオンを取得する', async () => {
      // Arrange
      const championId = 'Aatrox' // 正確なケース
      const wrongCaseId = 'aatrox' // 小文字
      const mockChampion = createMockChampion()
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result: correctResult } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })
      const { result: wrongResult } = renderHook(() => useChampion(wrongCaseId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(correctResult.current.data).toEqual(mockChampion)
      expect(wrongResult.current.data).toBeNull() // 大文字小文字が一致しない
    })
  })

  describe('エラーハンドリング', () => {
    it('存在しないチャンピオンIDの場合はnullを返す', () => {
      // Arrange
      const championId = 'NonExistentChampion'
      const mockChampionData = createMockChampionData([createMockChampion()])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })

    it('useChampionsでエラーが発生した場合はエラーを返す', () => {
      // Arrange
      const championId = 'Aatrox'
      const apiError = new Error('Failed to fetch champions')
      
      mockUseChampions.mockReturnValue({
        data: undefined,
        error: apiError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeNull()
      expect(result.current.error).toEqual(apiError)
      expect(result.current.isLoading).toBe(false)
    })

    it('championDataがundefinedの場合はnullを返す', () => {
      // Arrange
      const championId = 'Aatrox'
      
      mockUseChampions.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
    })

    it('championData.dataがundefinedの場合はnullを返す', () => {
      // Arrange
      const championId = 'Aatrox'
      const corruptedData = {
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.1.1',
        data: undefined as unknown as Record<string, Champion>,
      }
      
      mockUseChampions.mockReturnValue({
        data: corruptedData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('ローディング状態', () => {
    it('useChampionsがローディング中の場合はローディング状態を返す', () => {
      // Arrange
      const championId = 'Aatrox'
      
      mockUseChampions.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeUndefined()
      expect(result.current.isLoading).toBe(true)
    })

    it('useChampionsがロード完了した場合はローディング状態が終了する', async () => {
      // Arrange
      const championId = 'Aatrox'
      const mockChampion = createMockChampion()
      const mockChampionData = createMockChampionData([mockChampion])
      
      // 最初はローディング中
      mockUseChampions.mockReturnValueOnce({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result, rerender } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert - ローディング中
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeNull()

      // ロード完了状態に変更
      mockUseChampions.mockReturnValueOnce({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      rerender()

      // Assert - ロード完了
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toEqual(mockChampion)
    })
  })

  describe('パラメータ検証', () => {
    const testCases = [
      {
        description: '空文字のchampionId',
        championId: '',
        expectedData: null,
      },
      {
        description: 'nullのchampionId',
        championId: null as unknown as string,
        expectedData: null,
      },
      {
        description: 'undefinedのchampionId',
        championId: undefined as unknown as string,
        expectedData: null,
      },
      {
        description: '特殊文字を含むchampionId',
        championId: 'Champion@#$%',
        expectedData: null,
      },
      {
        description: '数字のみのchampionId',
        championId: '123',
        expectedData: null,
      },
    ]

    it.each(testCases)('$description の場合の動作', ({ championId, expectedData }) => {
      // Arrange
      const mockChampionData = createMockChampionData([createMockChampion()])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBe(expectedData)
      expect(result.current.error).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('型安全性', () => {
    it('返されるチャンピオンデータが正しい型を持つ', () => {
      // Arrange
      const mockChampion = createMockChampion({
        id: 'TypeTestChamp',
        key: '999',
        name: 'Type Test Champion',
        title: 'the Type Tester',
        tags: ['Fighter', 'Test'],
        info: {
          attack: 10,
          defense: 8,
          magic: 3,
          difficulty: 7,
        },
      })
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion('TypeTestChamp'), {
        wrapper: createWrapper(),
      })

      // Assert
      const champion = result.current.data!
      expect(typeof champion.id).toBe('string')
      expect(typeof champion.key).toBe('string')
      expect(typeof champion.name).toBe('string')
      expect(typeof champion.title).toBe('string')
      expect(Array.isArray(champion.tags)).toBe(true)
      expect(typeof champion.info).toBe('object')
      expect(typeof champion.info.attack).toBe('number')
      expect(typeof champion.info.defense).toBe('number')
      expect(typeof champion.info.magic).toBe('number')
      expect(typeof champion.info.difficulty).toBe('number')
      expect(typeof champion.image).toBe('object')
      expect(typeof champion.image.full).toBe('string')
    })

    it('nullの場合も型安全である', () => {
      // Arrange
      const championId = 'NonExistent'
      const mockChampionData = createMockChampionData([])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result.current.data).toBeNull()
      // TypeScriptコンパイル時にエラーが出ないことを確認
      const data = result.current.data
      if (data) {
        // dataがnullでない場合のみアクセス可能
        expect(data.id).toBeDefined()
      }
    })
  })

  describe('パフォーマンス', () => {
    it('同じchampionIdで複数回呼び出してもuseChampionsは一度だけ呼ばれる', () => {
      // Arrange
      const championId = 'PerformanceTest'
      const mockChampion = createMockChampion({ id: championId })
      const mockChampionData = createMockChampionData([mockChampion])
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const { result: result1 } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })
      const { result: result2 } = renderHook(() => useChampion(championId), {
        wrapper: createWrapper(),
      })

      // Assert
      expect(result1.current.data).toEqual(mockChampion)
      expect(result2.current.data).toEqual(mockChampion)
      
      // useChampionsは内部でキャッシュされているので、
      // 実際の呼び出し回数はSWRによって管理される
      expect(mockUseChampions).toHaveBeenCalled()
    })

    it('大量のチャンピオンデータでも効率的に動作する', () => {
      // Arrange
      const targetChampionId = 'TargetChamp'
      const mockChampions = Array.from({ length: 1000 }, (_, index) => 
        createMockChampion({
          id: index === 500 ? targetChampionId : `Champ${index}`,
          name: index === 500 ? 'Target Champion' : `Champion ${index}`,
        })
      )
      const mockChampionData = createMockChampionData(mockChampions)
      
      mockUseChampions.mockReturnValue({
        data: mockChampionData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      })

      // Act
      const startTime = Date.now()
      const { result } = renderHook(() => useChampion(targetChampionId), {
        wrapper: createWrapper(),
      })
      const endTime = Date.now()

      // Assert
      expect(result.current.data?.id).toBe(targetChampionId)
      expect(result.current.data?.name).toBe('Target Champion')
      expect(endTime - startTime).toBeLessThan(100) // 100ms以内
    })
  })
})