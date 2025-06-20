export interface Champion {
  id: string
  key: string
  name: string
  title: string
  image: {
    full: string
    sprite: string
    group: string
    x: number
    y: number
    w: number
    h: number
  }
  tags: string[]
  info: {
    attack: number
    defense: number
    magic: number
    difficulty: number
  }
}

export interface ChampionData {
  type: string
  format: string
  version: string
  data: Record<string, Champion>
}