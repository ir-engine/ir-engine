import { IdentityProvider } from './IdentityProvider'

export type RelationshipType = 'friend' | 'requested' | 'blocked' | 'blocking'
export type User = {
  id: string
  avatar: string
  name: string
  userRole: string
  identityProviders: IdentityProvider[]
  relationType?: RelationshipType
  inverseRelationType?: RelationshipType
}

export const UserSeed = {
  id: '',
  avatar: '',
  name: '',
  identityProviders: []
}

export function resolveUser (user: any): User {
  if (user && user.identity_providers) {
    return {
      ...user,
      identityProviders: user.identity_providers
    }
  }
  return user
}
