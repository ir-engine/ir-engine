import { IdentityProvider } from './IdentityProvider'
import { LocationAdmin } from './LocationAdmin'
import { LocationBan } from './LocationBan'
import { Party } from './Party'
import { UserId } from './UserId'
import { RelationshipType } from './UserRelationship'
import { UserApiKey } from './UserApiKey'

export interface UserSetting {
  id: string
  spatialAudioEnabled: boolean
  volume: number
  microphone: number
}

export interface UserScope {
  type: string
  id: string
}

export interface User {
  id?: UserId
  name: string
  userRole?: string
  avatarId?: string
  identityProviders?: IdentityProvider[]
  locationAdmins?: LocationAdmin[]
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
  identityProviders: [],
  locationAdmins: []
}

export function resolveUser(user: any): User {
  let returned = user
  if (user?.identity_providers) {
    returned = {
      ...returned,
      identityProviders: user.identity_providers
    }
  }
  if (user?.location_admins && user.location_admins.length > 0) {
    returned = {
      ...returned,
      locationAdmins: user.location_admins
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
    locationAdmins: [],
    avatarUrl: credentials.user.icon,
    apiKey: credentials.user.apiKey || { id: '', token: '', userId: '' as UserId }
  }

  return returned
}
