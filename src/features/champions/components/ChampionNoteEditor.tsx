'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mutate } from 'swr'
import { createNote, updateNote } from '@/features/notes/api'
import type { Note, CreateNoteRequest, UpdateNoteRequest } from '@/features/notes/types'

const championNoteSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, 'メモ内容は必須です'),
  tags: z.array(z.string()),
})

type ChampionNoteFormData = z.infer<typeof championNoteSchema>

interface ChampionNoteEditorProps {
  championId: string
  championName: string
  existingNote?: Note
  onCancel: () => void
  onSave: () => void
}

export const ChampionNoteEditor = ({
  championId,
  championName,
  existingNote,
  onCancel,
  onSave,
}: ChampionNoteEditorProps) => {
  const [tags, setTags] = useState<string[]>(existingNote?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!existingNote

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChampionNoteFormData>({
    resolver: zodResolver(championNoteSchema),
    defaultValues: {
      title: existingNote?.title || `${championName}のメモ`,
      content: existingNote?.content || '',
      tags: existingNote?.tags || [],
    },
  })

  useEffect(() => {
    setValue('tags', tags)
  }, [tags, setValue])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data: ChampionNoteFormData) => {
    try {
      setError(null)
      
      if (isEditing && existingNote) {
        const updateData: UpdateNoteRequest = {
          title: data.title,
          content: data.content,
          champion_id: championId,
          tags: data.tags,
        }
        await updateNote(existingNote.id, updateData)
      } else {
        const createData: CreateNoteRequest = {
          title: data.title,
          content: data.content,
          champion_id: championId,
          tags: data.tags,
        }
        await createNote(createData)
      }
      
      // Revalidate cache
      mutate(`notes:${championId}`)
      mutate('notes:all')
      onSave()
    } catch (error) {
      setError('メモの保存に失敗しました。')
      console.error('Save error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm text-gray-600 mb-1">
          タイトル
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="input-scrapbox"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm text-gray-600 mb-1">
          メモ内容
        </label>
        <textarea
          {...register('content')}
          id="content"
          rows={8}
          placeholder={`${championName}について...

例：
- ショートトレード得意
- ボーンアーマー積むと良い
- レベル6でオールイン強い
- 序盤はファーム重視`}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">
          タグ
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="タグを追加 (例: ビルド, コンボ, 対面)"
            className="flex-1 input-scrapbox"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={addTag}
            className="btn-scrapbox text-sm"
            disabled={isSubmitting}
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-gray-500 hover:text-red-600"
                disabled={isSubmitting}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-scrapbox-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '保存中...' : (isEditing ? '更新' : '作成')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-scrapbox"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}