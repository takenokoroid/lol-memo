'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useChampion } from '../hooks/useChampion'
import { useNotes } from '@/features/notes/hooks/useNotes'
import { CHAMPION_ICON_URL } from '@/shared/lib/riot-api/config'
import { ChampionNoteEditor } from './ChampionNoteEditor'
import { MatchupSection } from './MatchupSection'
import type { Note } from '@/features/notes/types'

interface ChampionDetailProps {
  championId: string
}

export const ChampionDetail = ({ championId }: ChampionDetailProps) => {
  const { data: champion, error: championError, isLoading: championLoading } = useChampion(championId)
  const { data: notes, error: notesError, isLoading: notesLoading } = useNotes(championId)
  const [isEditing, setIsEditing] = useState(false)

  if (championLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (championError || !champion) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">チャンピオン情報の読み込みに失敗しました。</p>
      </div>
    )
  }

  const championNote = notes?.find((note: Note) => note.champion_id === championId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Champion Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 relative">
              <Image
                src={CHAMPION_ICON_URL(champion.image.full)}
                alt={champion.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {champion.name}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              {champion.title}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {champion.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">攻撃</div>
                <div className="text-gray-600">{champion.info.attack}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">防御</div>
                <div className="text-gray-600">{champion.info.defense}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">魔法</div>
                <div className="text-gray-600">{champion.info.magic}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">難易度</div>
                <div className="text-gray-600">{champion.info.difficulty}/10</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Champion Note */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {champion.name}のメモ
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {isEditing ? 'キャンセル' : (championNote ? '編集' : 'メモを作成')}
          </button>
        </div>

        {isEditing ? (
          <ChampionNoteEditor
            championId={championId}
            championName={champion.name}
            existingNote={championNote}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <div>
            {championNote ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {championNote.title}
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {championNote.content}
                  </p>
                </div>
                {championNote.tags && championNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {championNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  最終更新: {new Date(championNote.updated_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>まだ{champion.name}のメモがありません。</p>
                <p>「メモを作成」ボタンをクリックして作成してください。</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Matchup Notes Section */}
      <MatchupSection 
        championId={championId}
        championName={champion.name}
      />
    </div>
  )
}