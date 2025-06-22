'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useChampions } from '../hooks/useChampions'
import { CHAMPION_ICON_URL } from '@/shared/lib/riot-api/config'
import type { Champion } from '../types'

export const ChampionList = () => {
  const { data: championData, error, isLoading } = useChampions()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const champions = useMemo(() => {
    if (!championData?.data) return []
    return Object.values(championData.data)
  }, [championData])

  const filteredChampions = useMemo(() => {
    return champions.filter((champion: Champion) => {
      const matchesSearch = champion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           champion.title.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRole = selectedRole === 'all' || champion.tags.includes(selectedRole)
      
      return matchesSearch && matchesRole
    })
  }, [champions, searchQuery, selectedRole])

  const roles = useMemo(() => {
    const allRoles = new Set<string>()
    champions.forEach((champion: Champion) => {
      champion.tags.forEach(tag => allRoles.add(tag))
    })
    return Array.from(allRoles).sort()
  }, [champions])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">チャンピオンデータの読み込みに失敗しました。</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded border border-gray-200">
        <h1 className="text-xl font-normal text-gray-800 mb-4">チャンピオン一覧</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="チャンピオン名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-scrapbox w-full"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="all">すべてのロール</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-green-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="グリッド表示"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-green-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="リスト表示"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Champions Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredChampions.map((champion: Champion) => (
              <Link
                key={champion.id}
                href={`/champions/${champion.id}`}
                className="group block p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="aspect-square relative mb-1">
                  <Image
                    src={CHAMPION_ICON_URL(champion.image.full)}
                    alt={champion.name}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12.5vw"
                    className="rounded object-cover"
                  />
                </div>
                <h3 className="text-xs text-gray-700 text-center truncate">
                  {champion.name}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChampions.map((champion: Champion) => (
              <Link
                key={champion.id}
                href={`/champions/${champion.id}`}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={CHAMPION_ICON_URL(champion.image.full)}
                    alt={champion.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {champion.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {champion.title}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {champion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredChampions.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">該当するチャンピオンが見つかりません。</p>
          </div>
        )}
      </div>
    </div>
  )
}