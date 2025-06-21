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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
        <p className="text-gray-500 mb-4">メモがありません。</p>
        <Link
          href="/notes/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          新しいメモを作成
        </Link>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          メモ一覧 {championId && `(${championId})`}
        </h2>
        <Link
          href="/notes/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          新しいメモを作成
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note: Note) => (
          <div
            key={note.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {note.title}
              </h3>
              <div className="flex gap-1 ml-2">
                <Link
                  href={`/notes/${note.id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                >
                  {deletingId === note.id ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {note.content}
            </p>
            
            {note.champion_id && (
              <div className="mb-2">
                <Link
                  href={`/champions/${note.champion_id}`}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  {note.champion_id}
                </Link>
              </div>
            )}
            
            {note.tags && note.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              <p>作成: {formatDate(note.created_at)}</p>
              {note.updated_at !== note.created_at && (
                <p>更新: {formatDate(note.updated_at)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}