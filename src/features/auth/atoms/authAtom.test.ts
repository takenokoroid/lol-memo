import { createStore } from 'jotai'
import { userAtom, isLoadingAuthAtom, isAuthenticatedAtom } from './authAtom'
import { userFixtures } from '@/__mocks__/fixtures/userData'

describe('authAtom', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
  })

  describe('userAtom', () => {
    it('初期値はnullである', () => {
      // Act
      const user = store.get(userAtom)

      // Assert
      expect(user).toBeNull()
    })

    it('ユーザー情報を設定できる', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()

      // Act
      store.set(userAtom, mockUser)
      const user = store.get(userAtom)

      // Assert
      expect(user).toEqual(mockUser)
    })

    it('ユーザー情報をnullに設定できる', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      store.set(userAtom, mockUser)

      // Act
      store.set(userAtom, null)
      const user = store.get(userAtom)

      // Assert
      expect(user).toBeNull()
    })

    it('異なるユーザー情報に更新できる', () => {
      // Arrange
      const mockUser1 = userFixtures.authenticatedUser()
      const mockUser2 = {
        ...userFixtures.authenticatedUser(),
        id: 'different-user-id',
        email: 'different@example.com',
      }

      // Act
      store.set(userAtom, mockUser1)
      expect(store.get(userAtom)).toEqual(mockUser1)

      store.set(userAtom, mockUser2)
      const finalUser = store.get(userAtom)

      // Assert
      expect(finalUser).toEqual(mockUser2)
      expect(finalUser).not.toEqual(mockUser1)
    })
  })

  describe('isLoadingAuthAtom', () => {
    it('初期値はtrueである', () => {
      // Act
      const isLoading = store.get(isLoadingAuthAtom)

      // Assert
      expect(isLoading).toBe(true)
    })

    it('ローディング状態をfalseに設定できる', () => {
      // Act
      store.set(isLoadingAuthAtom, false)
      const isLoading = store.get(isLoadingAuthAtom)

      // Assert
      expect(isLoading).toBe(false)
    })

    it('ローディング状態をtrueに戻すことができる', () => {
      // Arrange
      store.set(isLoadingAuthAtom, false)

      // Act
      store.set(isLoadingAuthAtom, true)
      const isLoading = store.get(isLoadingAuthAtom)

      // Assert
      expect(isLoading).toBe(true)
    })
  })

  describe('isAuthenticatedAtom', () => {
    it('ユーザーがnullの場合はfalseを返す', () => {
      // Arrange
      store.set(userAtom, null)

      // Act
      const isAuthenticated = store.get(isAuthenticatedAtom)

      // Assert
      expect(isAuthenticated).toBe(false)
    })

    it('ユーザーが存在する場合はtrueを返す', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      store.set(userAtom, mockUser)

      // Act
      const isAuthenticated = store.get(isAuthenticatedAtom)

      // Assert
      expect(isAuthenticated).toBe(true)
    })

    it('ユーザーがnullからユーザー情報に変更された場合、認証状態が更新される', () => {
      // Arrange
      store.set(userAtom, null)
      expect(store.get(isAuthenticatedAtom)).toBe(false)

      // Act
      const mockUser = userFixtures.authenticatedUser()
      store.set(userAtom, mockUser)
      const isAuthenticated = store.get(isAuthenticatedAtom)

      // Assert
      expect(isAuthenticated).toBe(true)
    })

    it('ユーザー情報からnullに変更された場合、認証状態が更新される', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      store.set(userAtom, mockUser)
      expect(store.get(isAuthenticatedAtom)).toBe(true)

      // Act
      store.set(userAtom, null)
      const isAuthenticated = store.get(isAuthenticatedAtom)

      // Assert
      expect(isAuthenticated).toBe(false)
    })
  })

  describe('アトム間の連携', () => {
    it('userAtomとisAuthenticatedAtomが正しく連携する', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()

      // Act & Assert - 初期状態
      expect(store.get(userAtom)).toBeNull()
      expect(store.get(isAuthenticatedAtom)).toBe(false)

      // Act & Assert - ユーザーログイン
      store.set(userAtom, mockUser)
      expect(store.get(userAtom)).toEqual(mockUser)
      expect(store.get(isAuthenticatedAtom)).toBe(true)

      // Act & Assert - ユーザーログアウト
      store.set(userAtom, null)
      expect(store.get(userAtom)).toBeNull()
      expect(store.get(isAuthenticatedAtom)).toBe(false)
    })

    it('isLoadingAuthAtomは他のアトムに影響されない', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()

      // Act & Assert - ローディング状態とユーザー状態は独立
      store.set(isLoadingAuthAtom, false)
      store.set(userAtom, mockUser)

      expect(store.get(isLoadingAuthAtom)).toBe(false)
      expect(store.get(userAtom)).toEqual(mockUser)
      expect(store.get(isAuthenticatedAtom)).toBe(true)

      // ユーザー状態を変更してもローディング状態は変わらない
      store.set(userAtom, null)
      expect(store.get(isLoadingAuthAtom)).toBe(false)
      expect(store.get(isAuthenticatedAtom)).toBe(false)
    })
  })

  describe('複数ストアでの動作', () => {
    it('異なるストアでは状態が独立している', () => {
      // Arrange
      const store1 = createStore()
      const store2 = createStore()
      const mockUser1 = userFixtures.authenticatedUser()
      const mockUser2 = {
        ...userFixtures.authenticatedUser(),
        id: 'user-2',
        email: 'user2@example.com',
      }

      // Act
      store1.set(userAtom, mockUser1)
      store2.set(userAtom, mockUser2)

      // Assert
      expect(store1.get(userAtom)).toEqual(mockUser1)
      expect(store2.get(userAtom)).toEqual(mockUser2)
      expect(store1.get(userAtom)).not.toEqual(store2.get(userAtom))
    })
  })

  describe('型安全性', () => {
    it('userAtomは正しいUser型を受け入れる', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()

      // Act & Assert - TypeScriptコンパイル時にエラーがないことを確認
      store.set(userAtom, mockUser)
      const user = store.get(userAtom)

      expect(user).toEqual(mockUser)
      
      // nullも受け入れる
      store.set(userAtom, null)
      expect(store.get(userAtom)).toBeNull()
    })

    it('isLoadingAuthAtomはboolean型のみを受け入れる', () => {
      // Act & Assert - TypeScriptコンパイル時にエラーがないことを確認
      store.set(isLoadingAuthAtom, true)
      expect(store.get(isLoadingAuthAtom)).toBe(true)

      store.set(isLoadingAuthAtom, false)
      expect(store.get(isLoadingAuthAtom)).toBe(false)
    })

    it('isAuthenticatedAtomは読み取り専用アトムである', () => {
      // Act & Assert - 計算されたアトムなので直接設定はできない
      const isAuthenticated = store.get(isAuthenticatedAtom)
      expect(typeof isAuthenticated).toBe('boolean')
    })
  })

  describe('エッジケース', () => {
    it('undefinedをuserAtomに設定した場合の動作', () => {
      // Arrange
      const mockUser = userFixtures.authenticatedUser()
      store.set(userAtom, mockUser)

      // Act
      store.set(userAtom, undefined as unknown as null)
      const user = store.get(userAtom)
      const isAuthenticated = store.get(isAuthenticatedAtom)

      // Assert - undefinedはfalsyなのでisAuthenticatedはfalseになる
      expect(user).toBeUndefined()
      expect(isAuthenticated).toBe(false)
    })

    it('空オブジェクトをuserAtomに設定した場合の動作', () => {
      // Act
      store.set(userAtom, {} as unknown as null)
      const user = store.get(userAtom)
      const isAuthenticated = store.get(isAuthenticatedAtom)

      // Assert - 空オブジェクトはtruthyなのでisAuthenticatedはtrueになる
      expect(user).toEqual({})
      expect(isAuthenticated).toBe(true)
    })
  })
})