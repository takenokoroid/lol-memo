'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mutate } from 'swr'
import { upsertMatchupNote, deleteMatchupNote } from '../api/matchupNotes'
import type { MatchupNote } from '../types'

const matchupNoteSchema = z.object({
  content: z.string().min(1, 'メモ内容は必須です'),
})

type MatchupNoteFormData = z.infer<typeof matchupNoteSchema>

interface MatchupNoteEditorProps {
  championId: string
  championName: string
  opponentId: string
  opponentName: string
  existingNote?: MatchupNote | null
  onCancel: () => void
  onSave: () => void
}

export const MatchupNoteEditor = ({
  championId,
  championName,
  opponentId,
  opponentName,
  existingNote,
  onCancel,
  onSave,
}: MatchupNoteEditorProps) => {
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const isEditing = !!existingNote

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MatchupNoteFormData>({
    resolver: zodResolver(matchupNoteSchema),
    defaultValues: {
      content: existingNote?.content || '',
    },
  })

  const onSubmit = async (data: MatchupNoteFormData) => {
    try {
      setError(null)
      await upsertMatchupNote(championId, opponentId, data.content)
      
      // Revalidate cache
      mutate(`matchup-notes:${championId}`)
      mutate(`matchup-note:${championId}:${opponentId}`)
      onSave()
    } catch (error) {
      setError('対面メモの保存に失敗しました。')
      console.error('Save error:', error)
    }
  }

  const handleDelete = async () => {
    if (!existingNote) return
    if (!confirm(`${championName} vs ${opponentName}の対面メモを削除しますか？`)) return

    try {
      setIsDeleting(true)
      await deleteMatchupNote(existingNote.id)
      
      // Revalidate cache
      mutate(`matchup-notes:${championId}`)
      mutate(`matchup-note:${championId}:${opponentId}`)
      onSave()
    } catch (error) {
      setError('対面メモの削除に失敗しました。')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h4 className="text-lg font-medium text-indigo-900 mb-2">
          {championName} vs {opponentName}
        </h4>
        <p className="text-sm text-indigo-700">
          この対面での戦略、注意点、有利不利の状況などを記録しましょう。
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            対面メモ
          </label>
          <textarea
            {...register('content')}
            id="content"
            rows={6}
            placeholder={`${championName} vs ${opponentName}について...

例：
- レベル6まで${opponentName}有利
- ショートトレード意識
- アイテム完成で逆転
- ガンク合わせが強い`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSubmitting || isDeleting}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex justify-between">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              disabled={isSubmitting || isDeleting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '保存中...' : (isEditing ? '更新' : '作成')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}