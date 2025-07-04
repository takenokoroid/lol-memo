'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mutate } from 'swr'
import { createNote, updateNote } from '../api'
import { ChampionSelect } from './ChampionSelect'
import type { Note, CreateNoteRequest, UpdateNoteRequest } from '../types'

const noteSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  content: z.string().min(1, 'メモ内容は必須です'),
  champion_id: z.string().min(1, 'チャンピオンを選択してください'),
  match_id: z.string().optional().nullable(),
  tags: z.array(z.string()),
})

type NoteFormData = z.infer<typeof noteSchema>

interface NoteEditorProps {
  note?: Note
  championId?: string
}

export const NoteEditor = ({ note, championId }: NoteEditorProps) => {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>(note?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectedChampionId, setSelectedChampionId] = useState(note?.champion_id || championId || '')
  const isEditing = !!note

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      champion_id: note?.champion_id || championId || '',
      tags: note?.tags || [],
    },
  })

  useEffect(() => {
    setValue('tags', tags)
  }, [tags, setValue])

  useEffect(() => {
    setValue('champion_id', selectedChampionId)
  }, [selectedChampionId, setValue])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (data: NoteFormData) => {
    try {
      setError(null)
      
      if (isEditing && note) {
        const updateData: UpdateNoteRequest = {
          title: data.title,
          content: data.content,
          champion_id: data.champion_id,
          tags: data.tags,
        }
        await updateNote(note.id, updateData)
        mutate(`note:${note.id}`)
      } else {
        const createData: CreateNoteRequest = {
          title: data.title,
          content: data.content,
          champion_id: data.champion_id,
          tags: data.tags,
        }
        await createNote(createData)
      }
      
      mutate(`notes:${data.champion_id || 'all'}`)
      router.push('/notes')
    } catch (error) {
      setError('メモの保存に失敗しました。')
      console.error('Save error:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-normal text-gray-800 mb-6">
        {isEditing ? 'メモを編集' : '新しいメモを作成'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            メモ内容
          </label>
          <textarea
            {...register('content')}
            id="content"
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            disabled={isSubmitting}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div>
          <ChampionSelect
            selectedChampionId={selectedChampionId}
            onSelect={(championId) => setSelectedChampionId(championId)}
            required={true}
            error={errors.champion_id?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            タグ
          </label>
          <div className="mt-1 flex gap-2">
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
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              placeholder="タグを追加..."
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-scrapbox-secondary"
              disabled={isSubmitting}
            >
              追加
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-green-600 hover:text-green-800"
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
            className="btn-scrapbox-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '保存中...' : (isEditing ? '更新' : '作成')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-scrapbox-secondary"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}