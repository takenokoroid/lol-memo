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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">チャンピオン一覧</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="チャンピオン名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

        {/* Champions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredChampions.map((champion: Champion) => (
            <Link
              key={champion.id}
              href={`/champions/${champion.id}`}
              className="group block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="aspect-square relative mb-2">
                <Image
                  src={CHAMPION_ICON_URL(champion.image.full)}
                  alt={champion.name}
                  fill
                  className="rounded-md object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center truncate">
                {champion.name}
              </h3>
              <p className="text-xs text-gray-500 text-center truncate">
                {champion.title}
              </p>
            </Link>
          ))}
        </div>

        {filteredChampions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">該当するチャンピオンが見つかりません。</p>
          </div>
        )}
      </div>
    </div>
  )
}