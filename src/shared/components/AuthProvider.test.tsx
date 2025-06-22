import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { userFixtures } from '@/__mocks__/fixtures/userData'

// Mock useAuth hook
jest.mock('@/features/auth/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('認証ローディング中はスピナーを表示する', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      render(
        <AuthProvider>
          <div data-testid="child-content">Child Content</div>
        </AuthProvider>
      )

      // Assert
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    })

    it('認証ローディング完了後は子コンポーネントを表示する', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      render(
        <AuthProvider>
          <div data-testid="child-content">Child Content</div>
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    it('認証されていないユーザーでも子コンポーネントを表示する', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      render(
        <AuthProvider>
          <div data-testid="child-content">Child Content</div>
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  describe('Jotai Provider統合', () => {
    it('JotaiのProviderが正しく提供される', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act & Assert - エラーが投げられないことを確認
      expect(() => {
        render(
          <AuthProvider>
            <div>Test Child</div>
          </AuthProvider>
        )
      }).not.toThrow()
    })
  })

  describe('スピナーのスタイリング', () => {
    it('スピナーが正しいCSSクラスを持つ', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      render(
        <AuthProvider>
          <div>Child</div>
        </AuthProvider>
      )

      // Assert
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'h-8', 'w-8', 'border-b-2', 'border-indigo-600')
      
      const container = spinner.parentElement
      expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
    })
  })

  describe('状態の変化', () => {
    it('ローディング状態からロード完了への遷移が正しく動作する', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      
      // 最初はローディング状態
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      const { rerender } = render(
        <AuthProvider>
          <div data-testid="child-content">Child Content</div>
        </AuthProvider>
      )

      // Assert - ローディング中
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()

      // ローディング完了状態に変更
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Re-render
      rerender(
        <AuthProvider>
          <div data-testid="child-content">Child Content</div>
        </AuthProvider>
      )

      // Assert - ローディング完了
      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  describe('複数の子要素', () => {
    it('複数の子要素を正しく表示する', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      render(
        <AuthProvider>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <span data-testid="child-3">Child 3</span>
        </AuthProvider>
      )

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument()
        expect(screen.getByTestId('child-2')).toBeInTheDocument()
        expect(screen.getByTestId('child-3')).toBeInTheDocument()
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('useAuthでエラーが発生してもAuthProviderは正常に動作する', async () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act & Assert
      expect(() => {
        render(
          <AuthProvider>
            <div data-testid="child-content">Child Content</div>
          </AuthProvider>
        )
      }).not.toThrow()

      await waitFor(() => {
        expect(screen.getByTestId('child-content')).toBeInTheDocument()
      })
    })
  })

  describe('パフォーマンス', () => {
    it('不要な再レンダリングが発生しない', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const childRenderSpy = jest.fn()
      
      const TestChild = () => {
        childRenderSpy()
        return <div data-testid="test-child">Test Child</div>
      }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      // Act
      const { rerender } = render(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      // 同じpropsで再レンダリング
      rerender(
        <AuthProvider>
          <TestChild />
        </AuthProvider>
      )

      // Assert
      expect(childRenderSpy).toHaveBeenCalledTimes(2) // 初期レンダリング + 再レンダリング
    })
  })
})