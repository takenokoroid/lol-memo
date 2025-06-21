'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useMatchupNotes, useMatchupNote } from '@/features/notes/hooks/useMatchupNotes'
import { CHAMPION_ICON_URL } from '@/shared/lib/riot-api/config'
import { OpponentSelector } from './OpponentSelector'
import { MatchupNoteEditor } from '@/features/notes/components/MatchupNoteEditor'
import { useChampion } from '../hooks/useChampion'
import type { MatchupNote } from '@/features/notes/types'

interface MatchupSectionProps {
  championId: string
  championName: string
}

export const MatchupSection = ({ championId, championName }: MatchupSectionProps) => {
  const { data: matchupNotes, isLoading: notesLoading } = useMatchupNotes(championId)
  const [showOpponentSelector, setShowOpponentSelector] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const { data: currentMatchupNote } = useMatchupNote(
    championId,
    selectedOpponent?.id || ''
  )

  const handleOpponentSelect = (opponentId: string, opponentName: string) => {
    setSelectedOpponent({ id: opponentId, name: opponentName })
    setShowOpponentSelector(false)
    setIsEditing(true)
  }

  const handleEditMatchup = (note: MatchupNote, opponentName: string) => {
    setSelectedOpponent({ id: note.opponent_id, name: opponentName })
    setIsEditing(true)
  }

  const handleSaveComplete = () => {
    setIsEditing(false)
    setSelectedOpponent(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedOpponent(null)
  }

  if (notesLoading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h2 className="text-lg font-normal text-gray-800 mb-3">対面メモ</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-normal text-gray-800">対面メモ</h2>
        <button
          onClick={() => setShowOpponentSelector(true)}
          className="btn-scrapbox-primary text-sm"
        >
          対面を追加
        </button>
      </div>

      {isEditing && selectedOpponent ? (
        <MatchupNoteEditor
          championId={championId}
          championName={championName}
          opponentId={selectedOpponent.id}
          opponentName={selectedOpponent.name}
          existingNote={currentMatchupNote}
          onCancel={handleCancel}
          onSave={handleSaveComplete}
        />
      ) : (
        <div>
          {matchupNotes && matchupNotes.length > 0 ? (
            <div className="space-y-4">
              {matchupNotes.map((note) => (
                <MatchupNoteCard
                  key={note.id}
                  note={note}
                  championName={championName}
                  onEdit={(opponentName) => handleEditMatchup(note, opponentName)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500">
              <p className="mb-1">まだ対面メモがありません。</p>
              <p className="text-xs">「対面を追加」ボタンから対面チャンピオンを選択してメモを作成してください。</p>
            </div>
          )}
        </div>
      )}

      {showOpponentSelector && (
        <OpponentSelector
          currentChampionId={championId}
          onSelect={handleOpponentSelect}
          onCancel={() => setShowOpponentSelector(false)}
        />
      )}
    </div>
  )
}

interface MatchupNoteCardProps {
  note: MatchupNote
  championName: string
  onEdit: (opponentName: string) => void
}

const MatchupNoteCard = ({ note, championName, onEdit }: MatchupNoteCardProps) => {
  const { data: opponentChampion } = useChampion(note.opponent_id)

  if (!opponentChampion) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 relative">
            <Image
              src={CHAMPION_ICON_URL(opponentChampion.image.full)}
              alt={opponentChampion.name}
              fill
              className="rounded object-cover"
            />
          </div>
          <span className="text-sm text-gray-800">
            {championName} vs {opponentChampion.name}
          </span>
        </div>
        <button
          onClick={() => onEdit(opponentChampion.name)}
          className="text-xs text-gray-500 hover:text-green-600"
        >
          編集
        </button>
      </div>
      
      <div className="text-sm text-gray-600 whitespace-pre-wrap mb-2 line-clamp-2">
        {note.content}
      </div>
      
      <div className="text-xs text-gray-500">
        最終更新: {new Date(note.updated_at).toLocaleDateString('ja-JP')}
      </div>
    </div>
  )
}