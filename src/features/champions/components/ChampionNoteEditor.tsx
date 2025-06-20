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
  tags: z.array(z.string()).default([]),
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          タイトル
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ
        </label>
        <div className="flex gap-2 mb-3">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
                disabled={isSubmitting}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '保存中...' : (isEditing ? '更新' : '作成')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}