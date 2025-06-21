import { ChampionDetail } from '@/features/champions/components/ChampionDetail'

interface ChampionPageProps {
  params: Promise<{
    championId: string
  }>
}

export default async function ChampionPage({ params }: ChampionPageProps) {
  const resolvedParams = await params
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChampionDetail championId={resolvedParams.championId} />
      </div>
    </div>
  )
}