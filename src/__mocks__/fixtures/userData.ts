import { faker } from '@faker-js/faker'
import type { User, Session } from '@supabase/supabase-js'

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: faker.string.uuid(),
  aud: 'authenticated',
  role: 'authenticated',
  email: faker.internet.email(),
  email_confirmed_at: faker.date.past().toISOString(),
  phone: null,
  confirmed_at: faker.date.past().toISOString(),
  last_sign_in_at: faker.date.recent().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: faker.date.past().toISOString(),
  updated_at: faker.date.recent().toISOString(),
  is_anonymous: false,
  ...overrides,
})

export const userFixtures = {
  // Standard authenticated user
  authenticatedUser: (): User => createMockUser({
    id: 'user-1',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
  }),

  // User without email confirmation
  unconfirmedUser: (): User => createMockUser({
    id: 'user-2',
    email: 'unconfirmed@example.com',
    email_confirmed_at: null,
  }),

  // Multiple users for testing
  multipleUsers: (count: number = 3): User[] => {
    return Array.from({ length: count }, (_, index) => 
      createMockUser({
        id: `user-${index + 1}`,
        email: `user${index + 1}@example.com`,
      })
    )
  },

  // Random user for property-based testing
  random: (): User => createMockUser(),
}

// Auth-related response types
export interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  }
  error: Error | null
}

export const createMockAuthResponse = (
  user: User | null = null,
  error: Error | null = null
): AuthResponse => ({
  data: {
    user,
    session: user ? {
      access_token: faker.string.alphanumeric(32),
      refresh_token: faker.string.alphanumeric(32),
      expires_in: 3600,
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'bearer',
      user,
    } : null,
  },
  error,
})

export const authFixtures = {
  successfulLogin: (): AuthResponse => 
    createMockAuthResponse(userFixtures.authenticatedUser()),

  failedLogin: (): AuthResponse => 
    createMockAuthResponse(null, {
      message: 'Invalid login credentials',
      status: 400,
    }),

  successfulSignUp: (): AuthResponse => 
    createMockAuthResponse(userFixtures.unconfirmedUser()),

  failedSignUp: (): AuthResponse => 
    createMockAuthResponse(null, {
      message: 'User already registered',
      status: 422,
    }),

  networkError: (): AuthResponse => 
    createMockAuthResponse(null, {
      message: 'Network error',
      status: 0,
    }),
}