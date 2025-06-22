import { NoteEditor } from '@/features/notes/components/NoteEditor'

interface NewNotePageProps {
  searchParams: Promise<{ championId?: string }>
}

export default async function NewNotePage({ searchParams }: NewNotePageProps) {
  const params = await searchParams
  
  return (
    <div className="container mx-auto px-4 py-8">
      <NoteEditor championId={params.championId} />
    </div>
  )
}