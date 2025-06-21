'use client'

import Link from 'next/link'
import { useState } from 'react'
import { mutate } from 'swr'
import { deleteNote } from '../api'
import { useNotes } from '../hooks/useNotes'
import type { Note } from '../types'

interface NoteListProps {
  championId?: string
}

export const NoteList = ({ championId }: NoteListProps) => {
  const { data: notes, error, isLoading } = useNotes(championId)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (noteId: string) => {
    if (!confirm('このメモを削除しますか？')) {
      return
    }

    try {
      setDeletingId(noteId)
      await deleteNote(noteId)
      mutate(`notes:${championId || 'all'}`)
    } catch (error) {
      console.error('Delete error:', error)
      alert('メモの削除に失敗しました。')
    } finally {
      setDeletingId(null)
    }
  }

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
        <p className="text-red-600">メモの読み込みに失敗しました。</p>
      </div>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500 mb-4">メモがありません。</p>
        <Link
          href="/notes/new"
          className="btn-scrapbox-primary"
        >
          新しいメモを作成
        </Link>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-normal text-gray-800">
          メモ一覧 {championId && <span className="text-sm text-gray-600">({championId})</span>}
        </h2>
        <Link
          href="/notes/new"
          className="btn-scrapbox-primary"
        >
          新しいメモを作成
        </Link>
      </div>

      <div className="space-y-3">
        {notes.map((note: Note) => (
          <div
            key={note.id}
            className="bg-white p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <Link
                href={`/notes/${note.id}`}
                className="text-base text-gray-800 hover:text-green-600 flex-1"
              >
                {note.title}
              </Link>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === note.id ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {note.content}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {note.champion_id && (
                <Link
                  href={`/champions/${note.champion_id}`}
                  className="text-green-600 hover:bg-green-50 px-1 rounded"
                >
                  {note.champion_id}
                </Link>
              )}
            
              {note.tags && note.tags.length > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex gap-1">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-gray-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <span className="text-gray-400">•</span>
              <span>{formatDate(note.created_at)}</span>
              {note.updated_at !== note.created_at && (
                <>
                  <span className="text-gray-400">•</span>
                  <span>更新: {formatDate(note.updated_at)}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}