'use client'

import { useNotes } from '@/features/notes/hooks/useNotes'
import { useRouter } from 'next/navigation'
import { deleteNote } from '@/features/notes/api'
import { mutate } from 'swr'
import type { Note } from '@/features/notes/types'

interface ChampionNotesSectionProps {
  championId: string
  championName: string
}

export const ChampionNotesSection = ({ championId, championName }: ChampionNotesSectionProps) => {
  const router = useRouter()
  const { data: notes, error, isLoading } = useNotes(championId)

  const handleDelete = async (noteId: string) => {
    if (confirm('このメモを削除してもよろしいですか？')) {
      try {
        await deleteNote(noteId)
        mutate(`notes:${championId}`)
      } catch (error) {
        console.error('Failed to delete note:', error)
        alert('メモの削除に失敗しました。')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h2 className="text-lg font-normal text-gray-800 mb-3">
          {championName}に関連するメモ
        </h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h2 className="text-lg font-normal text-gray-800 mb-3">
          {championName}に関連するメモ
        </h2>
        <p className="text-red-600 text-sm">メモの読み込みに失敗しました。</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-normal text-gray-800">
          {championName}に関連するメモ
        </h2>
        <button
          onClick={() => router.push(`/notes/new?championId=${championId}`)}
          className="btn-scrapbox text-sm"
        >
          メモを追加
        </button>
      </div>

      {notes && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note: Note) => (
            <div key={note.id} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {note.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    {note.tags && note.tags.length > 0 && (
                      <>
                        {note.tags.map((tag) => (
                          <span key={tag} className="text-green-600">#{tag}</span>
                        ))}
                        <span className="text-gray-400">•</span>
                      </>
                    )}
                    <span>{new Date(note.updated_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/notes/${note.id}`)}
                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-sm text-red-600 hover:text-red-700 hover:underline"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-gray-500">
          <p>まだ{championName}に関連するメモがありません。</p>
          <p>「メモを追加」ボタンをクリックして作成してください。</p>
        </div>
      )}
    </div>
  )
}