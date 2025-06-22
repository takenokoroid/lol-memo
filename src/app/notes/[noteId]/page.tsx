'use client'

import { useParams } from 'next/navigation'
import { NoteEditor } from '@/features/notes/components/NoteEditor'
import { useNote } from '@/features/notes/hooks/useNote'

export default function NoteDetailPage() {
  const params = useParams()
  const noteId = params.noteId as string
  const { data: note, error, isLoading } = useNote(noteId)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">メモが見つかりません</h1>
          <p className="text-gray-600">指定されたメモは存在しないか、アクセス権限がありません。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NoteEditor note={note} />
    </div>
  )
}