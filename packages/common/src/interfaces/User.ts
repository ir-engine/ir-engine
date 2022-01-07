import { IdentityProvider } from './IdentityProvider'
import { LocationAdmin } from './LocationAdmin'
import { LocationBan } from './LocationBan'
import { UserId } from './UserId'
import { RelationshipType } from './UserRelationship'
import { LocationAuthorizedUser } from './LocationAuthorizedUser'

export interface UserSetting {
  id: string
  spatialAudioEnabled: boolean
  volume: number
  microphone: number
}

export interface UserScope {
  type: string
}

export interface User {
  id?: UserId
  name: string
  userRole?: string
  avatarId?: string
  identityProviders?: IdentityProvider[]
  locationAdmins?: LocationAdmin[]
  locationAuthorizedUsers?: LocationAuthorizedUser[]
  relationType?: RelationshipType
  inverseRelationType?: RelationshipType
  avatarUrl?: string
  instanceId?: string
  channelInstanceId?: string
  partyId?: string
  locationBans?: LocationBan[]
  user_setting?: UserSetting
  inviteCode?: string
  scopes?: UserScope[]
}

export const UserSeed: User = {
  id: '' as UserId,
  name: '',
  userRole: '',
  avatarId: '',
  identityProviders: [],
  locationAdmins: [],
  locationAuthorizedUsers: []
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
  if (user?.location_authorized_users && user.location_authorized_users.length > 0) {
    returned = {
      ...returned,
      locationAuthorizedUsers: user.location_authorized_users
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
    avatarUrl: credentials.user.icon
  }

  return returned
}
