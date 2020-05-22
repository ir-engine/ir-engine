import { IdentityProvider } from './IdentityProvider'

export type RelationshipType = 'friend' | 'requested' | 'blocked' | 'blocking'
export type User = {
  id: string
  avatar: string
  name: string
  userRole: string
  identityProviders: IdentityProvider[]
  relationType?: RelationshipType
  inverseRelationType?: RelationshipType,
  subscriptions: any[]
}

export const UserSeed = {
  id: '',
  avatar: '',
  name: '',
  identityProviders: []
}

export function resolveUser (user: any): User {
  let returned = user
  if (user && user.identity_providers) {
    returned = {
      ...returned,
      identityProviders: user.identity_providers
    }
  }
  if (user && user.subscriptions && user.subscriptions.length > 0) {
    const verifiedSubscription = user.subscriptions.find(item => item.status === true)
    returned = {
      ...returned,
      subscription: verifiedSubscription
    }
    delete returned.subscriptions
  }
  return returned
}
