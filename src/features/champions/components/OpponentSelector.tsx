'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useChampions } from '../hooks/useChampions'
import { CHAMPION_ICON_URL } from '@/shared/lib/riot-api/config'
import type { Champion } from '../types'

interface OpponentSelectorProps {
  currentChampionId: string
  onSelect: (championId: string, championName: string) => void
  onCancel: () => void
}

export const OpponentSelector = ({ currentChampionId, onSelect, onCancel }: OpponentSelectorProps) => {
  const { data: championData, error, isLoading } = useChampions()
  const [searchQuery, setSearchQuery] = useState('')

  const champions = useMemo(() => {
    if (!championData?.data) return []
    return Object.values(championData.data).filter(
      (champion: Champion) => champion.id !== currentChampionId
    )
  }, [championData, currentChampionId])

  const filteredChampions = useMemo(() => {
    return champions.filter((champion: Champion) =>
      champion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      champion.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [champions, searchQuery])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <p className="text-red-600 text-center">チャンピオンデータの読み込みに失敗しました。</p>
          <button
            onClick={onCancel}
            className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            閉じる
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            対面チャンピオンを選択
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="チャンピオン名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-y-auto max-h-96">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredChampions.map((champion: Champion) => (
              <button
                key={champion.id}
                onClick={() => onSelect(champion.id, champion.name)}
                className="group block bg-gray-50 rounded-lg p-3 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all"
              >
                <div className="aspect-square relative mb-2">
                  <Image
                    src={CHAMPION_ICON_URL(champion.image.full)}
                    alt={champion.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.66vw"
                    className="rounded-md object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="text-sm font-medium text-gray-900 text-center truncate">
                  {champion.name}
                </h4>
                <p className="text-xs text-gray-500 text-center truncate">
                  {champion.title}
                </p>
              </button>
            ))}
          </div>

          {filteredChampions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">該当するチャンピオンが見つかりません。</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}