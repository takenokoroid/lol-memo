import { NextRequest, NextResponse } from 'next/server'
import { RIOT_API_BASE_URL } from '@/shared/lib/riot-api/config'

const RIOT_API_KEY = process.env.RIOT_API_KEY

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!RIOT_API_KEY) {
    return NextResponse.json(
      { error: 'Riot API key is not configured' },
      { status: 500 }
    )
  }

  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${RIOT_API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`

  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
      next: {
        revalidate: 60, // Cache for 1 minute
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: `Riot API error: ${response.status}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Riot API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Riot API' },
      { status: 500 }
    )
  }
}