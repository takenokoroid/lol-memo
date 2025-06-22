import { renderHook, act, waitFor } from '@testing-library/react'
import { Provider } from 'jotai'
import { useAuth } from './useAuth'
import { userFixtures } from '@/__mocks__/fixtures/userData'
import React from 'react'

// Get mock from global
const mockSupabaseClient = global.mockSupabaseClient

// Jotai Provider wrapper
const createWrapper = () => {
  const ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(Provider, null, children)
  }
  ProviderWrapper.displayName = 'ProviderWrapper'
  return ProviderWrapper
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('初期化', () => {
    it('初期状態ではloading: true, user: nullを返す', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Assert - 初期状態
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(true)

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('認証済みユーザーがいる場合はユーザー情報を取得する', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
    })

    it('認証チェックでエラーが発生してもアプリが落ちない', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const authError = new Error('Auth service unavailable')
      
      mockSupabaseClient.auth.getUser.mockRejectedValue(authError)
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking auth status:', authError)
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('認証状態の変更監視', () => {
    it('ログイン時にユーザー情報が更新される', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      let authStateChangeCallback: (event: string, session: unknown) => void

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        }
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate login
      act(() => {
        authStateChangeCallback('SIGNED_IN', { user: mockUser })
      })

      // Assert
      expect(result.current.user).toEqual(mockUser)
    })

    it('ログアウト時にユーザー情報がnullになる', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      let authStateChangeCallback: (event: string, session: unknown) => void

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: jest.fn(),
            },
          },
        }
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Simulate logout
      act(() => {
        authStateChangeCallback('SIGNED_OUT', null)
      })

      // Assert
      expect(result.current.user).toBeNull()
    })

    it('コンポーネントアンマウント時にsubscriptionが解除される', async () => {
      // Arrange
      const mockUnsubscribe = jest.fn()
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      })

      // Act
      const { unmount } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
      })

      unmount()

      // Assert
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('signIn', () => {
    it('正しい認証情報でログインできる', async () => {
      // Arrange
      const email = 'test@example.com'
      const password = 'password123'
      const mockUser = userFixtures.authenticatedUser()
      const expectedData = {
        user: mockUser,
        session: { access_token: 'mock-token' },
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: expectedData,
        error: null,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const loginResult = await act(async () => {
        return await result.current.signIn(email, password)
      })

      // Assert
      expect(loginResult).toEqual(expectedData)
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      })
    })

    it('無効な認証情報の場合はエラーを投げる', async () => {
      // Arrange
      const email = 'invalid@example.com'
      const password = 'wrongpassword'
      const authError = new Error('Invalid credentials')

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: authError,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      await expect(
        act(async () => {
          await result.current.signIn(email, password)
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signUp', () => {
    it('新規ユーザー登録ができる', async () => {
      // Arrange
      const email = 'newuser@example.com'
      const password = 'newpassword123'
      const mockUser = userFixtures.authenticatedUser()
      const expectedData = {
        user: mockUser,
        session: { access_token: 'mock-token' },
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: expectedData,
        error: null,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const signUpResult = await act(async () => {
        return await result.current.signUp(email, password)
      })

      // Assert
      expect(signUpResult).toEqual(expectedData)
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
      })
    })

    it('既に存在するメールアドレスの場合はエラーを投げる', async () => {
      // Arrange
      const email = 'existing@example.com'
      const password = 'password123'
      const authError = new Error('User already exists')

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: authError,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      await expect(
        act(async () => {
          await result.current.signUp(email, password)
        })
      ).rejects.toThrow('User already exists')
    })
  })

  describe('signOut', () => {
    it('ログアウトができる', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.signOut()
      })

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1)
    })

    it('ログアウト時にエラーが発生した場合はエラーを投げる', async () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      const signOutError = new Error('Logout failed')

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: signOutError,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Assert
      await expect(
        act(async () => {
          await result.current.signOut()
        })
      ).rejects.toThrow('Logout failed')
    })
  })

  describe('境界値・エラーケース', () => {
    const testCases = [
      {
        description: '空のメールアドレスでログイン',
        email: '',
        password: 'password123',
        expectedError: 'Invalid email',
      },
      {
        description: '空のパスワードでログイン',
        email: 'test@example.com',
        password: '',
        expectedError: 'Password is required',
      },
      {
        description: '不正な形式のメールアドレス',
        email: 'invalid-email',
        password: 'password123',
        expectedError: 'Invalid email format',
      },
      {
        description: '短すぎるパスワード',
        email: 'test@example.com',
        password: '123',
        expectedError: 'Password too short',
      },
    ]

    it.each(testCases)('$description', async ({ email, password, expectedError }) => {
      // Arrange
      const authError = new Error(expectedError)

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: authError,
      })

      // Act
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Assert
      await expect(
        act(async () => {
          await result.current.signIn(email, password)
        })
      ).rejects.toThrow(expectedError)
    })
  })
})