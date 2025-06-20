export const RIOT_API_BASE_URL = 'https://jp1.api.riotgames.com'
export const RIOT_API_REGIONS = {
  JP: 'jp1',
  NA: 'na1',
  EUW: 'euw1',
  KR: 'kr',
} as const

export const DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com'
export const DDRAGON_VERSION = '14.24.1' // Update this periodically

export const CHAMPION_ICON_URL = (championImageFull: string) =>
  `${DDRAGON_BASE_URL}/cdn/${DDRAGON_VERSION}/img/champion/${championImageFull}`

export const ITEM_ICON_URL = (itemId: string) =>
  `${DDRAGON_BASE_URL}/cdn/${DDRAGON_VERSION}/img/item/${itemId}.png`

export const SPELL_ICON_URL = (spellId: string) =>
  `${DDRAGON_BASE_URL}/cdn/${DDRAGON_VERSION}/img/spell/${spellId}.png`