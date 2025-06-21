import { http, HttpResponse } from 'msw'
import { championFixtures } from './fixtures/championData'

export const handlers = [
  // Mock Data Dragon Champion API
  http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
    return HttpResponse.json({
      type: 'champion',
      format: 'standAloneComplex',
      version: '14.24.1',
      data: championFixtures.multipleChampions(),
    })
  }),

  // Mock Next.js API routes for Riot API
  http.get('/api/riot/*', ({ request }) => {
    const url = new URL(request.url)
    const path = url.pathname.replace('/api/riot/', '')

    if (path.includes('champion.json')) {
      return HttpResponse.json({
        type: 'champion',
        format: 'standAloneComplex',
        version: '14.24.1',
        data: championFixtures.multipleChampions(),
      })
    }

    // Default mock response
    return HttpResponse.json({ message: 'Mock API response' })
  }),

  // Mock other external APIs if needed
  http.get('https://ddragon.leagueoflegends.com/cdn/*/img/champion/*', () => {
    // Return a mock image response
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    })
  }),
]