import { ChampionDetail } from '@/features/champions/components/ChampionDetail'

interface ChampionPageProps {
  params: Promise<{
    championId: string
  }>
}

export default async function ChampionPage({ params }: ChampionPageProps) {
  const resolvedParams = await params
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ChampionDetail championId={resolvedParams.championId} />
    </div>
  )
}