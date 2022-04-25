import { AdminScopeType } from './AdminScopeType'
import { IdentityProvider } from './IdentityProvider'
import { LocationAdmin } from './LocationAdmin'
import { LocationBan } from './LocationBan'
import { Party } from './Party'
import { UserApiKey } from './UserApiKey'
import { UserId } from './UserId'
import { RelationshipType } from './UserRelationship'

export interface UserSetting {
  id: string
  spatialAudioEnabled: boolean
  volume?: number
  audio: number
  microphone: number
  themeMode: string
}

export interface UserScope {
  type: string
  id: string
}

export interface User {
  id: UserId
  name: string
  userRole?: string
  avatarId?: string
  identityProviders?: IdentityProvider[]
  relationType?: RelationshipType
  inverseRelationType?: RelationshipType
  avatarUrl?: string
  instanceId?: string
  channelInstanceId?: string
  partyId?: string
  locationBans?: LocationBan[]
  user_setting?: UserSetting
  inviteCode?: string
  party?: Party
  scopes?: UserScope[]
  apiKey: UserApiKey
}

export const UserSeed: User = {
  id: '' as UserId,
  name: '',
  userRole: '',
  avatarId: '',
  apiKey: {
    id: '',
    token: '',
    userId: '' as UserId
  },
  identityProviders: []
}

export interface CreateEditUser {
  name: string
  avatarId: string
  userRole: string
  scopes: AdminScopeType[]
}

export function resolveUser(user: any): User {
  let returned = user
  if (user?.identity_providers) {
    returned = {
      ...returned,
      identityProviders: user.identity_providers
    }
  }
  if (user?.location_bans && user.location_bans.length > 0) {
    returned = {
      ...returned,
      locationBans: user.location_bans
    }
  }
  if (user?.user_api_key && user.user_api_key.id) {
    returned = {
      ...returned,
      apiKey: user.user_api_key
    }
  }

  // console.log('Returned user:')
  // console.log(returned)
  return returned
}

export function resolveWalletUser(credentials: any): User {
  let returned = {
    id: '' as UserId,
    instanceId: credentials.user.id,
    name: credentials.user.displayName,
    userRole: 'guest',
    avatarId: credentials.user.id,
    identityProviders: [],
    avatarUrl: credentials.user.icon,
    apiKey: credentials.user.apiKey || { id: '', token: '', userId: '' as UserId }
  }

  return returned
}
