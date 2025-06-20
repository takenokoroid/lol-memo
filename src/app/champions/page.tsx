import { ChampionList } from '@/features/champions/components/ChampionList'

export default function ChampionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChampionList />
      </div>
    </div>
  )
}