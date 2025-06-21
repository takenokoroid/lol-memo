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
  const { data: notes } = useNotes(championId)
  const [isEditing, setIsEditing] = useState(false)

  if (championLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
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
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Champion Info */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 relative">
              <Image
                src={CHAMPION_ICON_URL(champion.image.full)}
                alt={champion.name}
                fill
                sizes="80px"
                className="rounded object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-normal text-gray-800 mb-1">
              {champion.name}
            </h1>
            <p className="text-sm text-gray-600 mb-3">
              {champion.title}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {champion.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-gray-600">
              <div>
                <span className="text-gray-500">攻撃:</span> {champion.info.attack}/10
              </div>
              <div>
                <span className="text-gray-500">防御:</span> {champion.info.defense}/10
              </div>
              <div>
                <span className="text-gray-500">魔法:</span> {champion.info.magic}/10
              </div>
              <div>
                <span className="text-gray-500">難易度:</span> {champion.info.difficulty}/10
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Champion Note */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-normal text-gray-800">
            {champion.name}のメモ
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-scrapbox text-sm"
          >
            {isEditing ? 'キャンセル' : (championNote ? '編雈' : 'メモを作成')}
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
                <h3 className="text-base font-normal text-gray-800 mb-2">
                  {championNote.title}
                </h3>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {championNote.content}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  {championNote.tags && championNote.tags.length > 0 && (
                    <>
                      {championNote.tags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                      <span className="text-gray-400">•</span>
                    </>
                  )}
                  <span>最終更新: {new Date(championNote.updated_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500">
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