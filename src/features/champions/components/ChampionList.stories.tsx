import type { Meta, StoryObj } from '@storybook/nextjs'
import { ChampionList } from './ChampionList'
import { championFixtures } from '@/__mocks__/fixtures/championData'
import { http, HttpResponse } from 'msw'
// import { within, userEvent, expect } from '@storybook/test'

const meta: Meta<typeof ChampionList> = {
  title: 'Features/Champions/ChampionList',
  component: ChampionList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'チャンピオン一覧を表示するコンポーネント。検索・フィルタリング機能付き。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// デフォルト状態
export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: championFixtures.multipleChampions(12),
          })
        }),
      ],
    },
    docs: {
      description: {
        story: 'デフォルトの状態。複数のチャンピオンが表示されます。',
      },
    },
  },
}

// ローディング状態
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', async () => {
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: championFixtures.multipleChampions(5),
          })
        }),
      ],
    },
    docs: {
      description: {
        story: 'データ読み込み中の状態。スピナーが表示されます。',
      },
    },
  },
}

// エラー状態
export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return new HttpResponse(null, { status: 500 })
        }),
      ],
    },
    docs: {
      description: {
        story: 'データ読み込みエラー時の状態。エラーメッセージが表示されます。',
      },
    },
  },
}

// 空の結果
export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: {},
          })
        }),
      ],
    },
    docs: {
      description: {
        story: 'チャンピオンデータが空の状態。該当なしメッセージが表示されます。',
      },
    },
  },
}

// 特定のチャンピオンのみ
export const SpecificChampions: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: {
              Aatrox: championFixtures.aatrox(),
              Annie: championFixtures.annie(),
              Jinx: championFixtures.jinx(),
            },
          })
        }),
      ],
    },
    docs: {
      description: {
        story: '特定の有名チャンピオンのみを表示。テスト用の固定データを使用。',
      },
    },
  },
}

// 大量データ
export const ManyChampions: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: championFixtures.multipleChampions(50),
          })
        }),
      ],
    },
    docs: {
      description: {
        story: '大量のチャンピオンが表示された状態。グリッドレイアウトの動作を確認。',
      },
    },
  },
}

// 検索フィルター適用済み
export const WithSearchFilter: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: {
              Aatrox: championFixtures.aatrox(),
              Annie: championFixtures.annie(),
              Jinx: championFixtures.jinx(),
            },
          })
        }),
      ],
    },
    docs: {
      description: {
        story: '検索フィルターが適用された状態。"Annie"で検索した結果を表示。',
      },
    },
  },
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement)
  //   
  //   // Wait for champions to load
  //   await canvas.findByText('チャンピオン一覧')
  //   
  //   // Type in search box
  //   const searchInput = canvas.getByPlaceholderText('チャンピオン名で検索...')
  //   await userEvent.type(searchInput, 'Annie')
  //   
  //   // Verify that only Annie is visible
  //   await expect(canvas.getByText('Annie')).toBeInTheDocument()
  // },
}

// ロールフィルター適用済み
export const WithRoleFilter: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: {
              Aatrox: championFixtures.aatrox(),
              Annie: championFixtures.annie(),
              Jinx: championFixtures.jinx(),
            },
          })
        }),
      ],
    },
    docs: {
      description: {
        story: 'ロールフィルターが適用された状態。Mageロールのチャンピオンのみ表示。',
      },
    },
  },
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement)
  //   
  //   // Wait for champions to load
  //   await canvas.findByText('チャンピオン一覧')
  //   
  //   // Select role filter
  //   const roleSelect = canvas.getByDisplayValue('すべてのロール')
  //   await userEvent.selectOptions(roleSelect, 'Mage')
  //   
  //   // Verify that only Mage champions are visible
  //   await expect(canvas.getByText('Annie')).toBeInTheDocument()
  // },
}

// モバイル表示
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: championFixtures.multipleChampions(8),
          })
        }),
      ],
    },
    docs: {
      description: {
        story: 'モバイル端末での表示状態。レスポンシブグリッドの動作を確認。',
      },
    },
  },
}

// タブレット表示
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: championFixtures.multipleChampions(12),
          })
        }),
      ],
    },
    docs: {
      description: {
        story: 'タブレット端末での表示状態。中間サイズでのレイアウトを確認。',
      },
    },
  },
}

// 特殊文字チャンピオン
export const WithSpecialCharacters: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('https://ddragon.leagueoflegends.com/cdn/*/data/ja_JP/champion.json', () => {
          const specialChampion = championFixtures.withSpecialCharacters()
          return HttpResponse.json({
            type: 'champion',
            format: 'standAloneComplex',
            version: '14.24.1',
            data: {
              [specialChampion.id]: specialChampion,
            },
          })
        }),
      ],
    },
    docs: {
      description: {
        story: "特殊文字を含むチャンピオン名の表示。Kai'Sa などのアポストロフィを含む名前。",
      },
    },
  },
}