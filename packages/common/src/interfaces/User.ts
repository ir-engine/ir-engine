import { InstanceInterface } from '../dbmodels/Instance'
import { AdminScopeType } from './AdminScopeType'
import { AvatarInterface } from './AvatarInterface'
import { ThemeMode } from './ClientSetting'
import { IdentityProvider } from './IdentityProvider'
import { LocationAdmin } from './LocationAdmin'
import { LocationBan } from './LocationBan'
import { Party } from './Party'
import { StaticResourceInterface } from './StaticResourceInterface'
import { UserApiKey } from './UserApiKey'
import { UserId } from './UserId'
import { RelationshipType } from './UserRelationship'

export interface UserSetting {
  id: string
  themeModes: ThemeMode
}

export interface UserScope {
  type: string
  id?: string
}

export interface UserInterface {
  id: UserId
  name: string
  isGuest: boolean
  avatarId: string
  avatar: AvatarInterface
  identity_providers?: IdentityProvider[]
  identityProviders?: IdentityProvider[]
  locationAdmins?: LocationAdmin[]
  relationType?: RelationshipType
  inverseRelationType?: RelationshipType
  avatarUrl?: string
  /** @deprecated */
  instanceId?: string
  /** @deprecated */
  instance?: InstanceInterface
  /** @deprecated */
  channelInstanceId?: string
  /** @deprecated */
  channelInstance?: InstanceInterface
  /** @deprecated */
  partyId?: string
  /** @deprecated */
  party?: Party
  locationBans?: LocationBan[]
  user_setting?: UserSetting
  inviteCode?: string
  scopes?: UserScope[]
  apiKey: UserApiKey
  static_resources?: StaticResourceInterface
}

export const UserSeed: UserInterface = {
  id: '' as UserId,
  name: '',
  isGuest: true,
  avatarId: '',
  avatar: {
    id: '',
    name: '',
    isPublic: true,
    userId: '',
    modelResourceId: '',
    thumbnailResourceId: '',
    identifierName: ''
  },
  apiKey: {
    id: '',
    token: '',
    userId: '' as UserId
  },
  identityProviders: [],
  locationAdmins: []
}

export interface CreateEditUser {
  name: string
  avatarId?: string
  inviteCode?: string
  isGuest?: boolean
  scopes?: UserScope[] | AdminScopeType[]
}

export function resolveUser(user: any): UserInterface {
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

export function resolveWalletUser(credentials: any): UserInterface {
  return {
    id: '' as UserId,
    instanceId: credentials.user.id,
    name: credentials.user.displayName,
    isGuest: true,
    avatarId: credentials.user.id,
    avatar: {
      id: '',
      name: '',
      isPublic: true,
      userId: '',
      modelResourceId: '',
      thumbnailResourceId: '',
      identifierName: ''
    },
    identityProviders: [],
    locationAdmins: [],
    avatarUrl: credentials.user.icon,
    apiKey: credentials.user.apiKey || { id: '', token: '', userId: '' as UserId }
  }
}
