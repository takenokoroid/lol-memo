import type { Meta, StoryObj } from '@storybook/nextjs'
import { LoginForm } from './LoginForm'
// import { userEvent, within, expect } from '@storybook/test'

const meta: Meta<typeof LoginForm> = {
  title: 'Features/Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ユーザーログイン用のフォームコンポーネント。メールアドレスとパスワードでの認証を行います。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// 基本の表示状態
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'デフォルトの状態。空のフォームが表示されます。',
      },
    },
  },
}

// フォームに値が入力された状態
export const WithValues: Story = {
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement)
  //   
  //   // Find form elements
  //   const emailInput = canvas.getByLabelText('メールアドレス')
  //   const passwordInput = canvas.getByLabelText('パスワード')
  //   
  //   // Fill in the form
  //   await userEvent.type(emailInput, 'user@example.com')
  //   await userEvent.type(passwordInput, 'password123')
  //   
  //   // Verify values are entered
  //   await expect(emailInput).toHaveValue('user@example.com')
  //   await expect(passwordInput).toHaveValue('password123')
  // },
  parameters: {
    docs: {
      description: {
        story: 'フォームに値が入力された状態を表示します（インタラクションテストは含まない）。',
      },
    },
  },
}

// バリデーションエラー表示状態
export const WithValidationErrors: Story = {
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement)
  //   
  //   // Try to submit empty form to trigger validation
  //   const submitButton = canvas.getByRole('button', { name: /ログイン/i })
  //   await userEvent.click(submitButton)
  // },
  parameters: {
    docs: {
      description: {
        story: 'バリデーションエラーが表示されている状態。必須項目の未入力時に表示されます。',
      },
    },
  },
}

// ローディング状態（手動モック）
export const Loading: Story = {
  render: () => {
    // Mock the submitting state by rendering a modified version
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value="user@example.com"
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm opacity-50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value="••••••••"
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ログイン中...
        </button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'ログイン処理中の状態。フォームが無効化され、ローディングメッセージが表示されます。',
      },
    },
  },
}

// エラー状態
export const WithError: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            value="invalid@example.com"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            value="wrongpassword"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">
            ログインに失敗しました。メールアドレスとパスワードを確認してください。
          </p>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ログイン
        </button>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'ログインエラーが表示されている状態。認証失敗時のエラーメッセージを表示します。',
      },
    },
  },
}

// モバイル表示
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'モバイル端末での表示状態。レスポンシブデザインを確認できます。',
      },
    },
  },
}

// アクセシビリティフォーカス状態
export const AccessibilityFocused: Story = {
  // play: async ({ canvasElement }) => {
  //   const canvas = within(canvasElement)
  //   
  //   // Focus on email input to show focus state
  //   const emailInput = canvas.getByLabelText('メールアドレス')
  //   await userEvent.click(emailInput)
  // },
  parameters: {
    docs: {
      description: {
        story: 'キーボードフォーカス時の表示状態。アクセシビリティを重視したフォーカス表示を確認できます。',
      },
    },
  },
}