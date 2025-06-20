import { ChampionDetail } from '@/features/champions/components/ChampionDetail'

interface ChampionPageProps {
  params: {
    championId: string
  }
}

export default function ChampionPage({ params }: ChampionPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChampionDetail championId={params.championId} />
      </div>
    </div>
  )
}