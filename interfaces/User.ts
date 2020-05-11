import { IdentityProvider } from './IdentityProvider'

export type User = {
  id: string
  avatar: string
  identityProviders: IdentityProvider[]
}

export const resolveUser = (user: any): User => {
  if (user && user.identity_providers) {
    return {
      ...user,
      identityProviders: user.identity_providers
    }
  }
  return user
}
