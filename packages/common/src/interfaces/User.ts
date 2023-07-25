/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { UserApiKeyType } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { AdminScopeType } from './AdminScopeType'
import { IdentityProvider } from './IdentityProvider'
import { InstanceAttendanceInterface } from './InstanceAttendance'
import { LocationAdmin } from './LocationAdmin'
import { LocationBan } from './LocationBan'
import { Party } from './Party'
import { StaticResourceInterface } from './StaticResourceInterface'
import { UserId } from './UserId'
import { RelationshipType } from './UserRelationship'

export interface UserSetting {
  id: string
  themeModes: Record<string, string>
}

export interface UserScope {
  type: string
  id?: string
}

export interface UserKick {
  id: string
  duration: Date
  userId: UserId
  instanceId: string
}

export interface CreateUserKick extends Omit<UserKick, 'id'> {}

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
  partyId?: string
  party?: Party
  locationBans?: LocationBan[]
  user_setting?: UserSetting
  inviteCode?: string
  scopes?: UserScope[]
  apiKey: UserApiKeyType
  static_resources?: StaticResourceInterface
  instanceAttendance?: InstanceAttendanceInterface[]
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
    userId: '' as UserId,
    createdAt: '',
    updatedAt: ''
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

type AvatarInterface = {
  id: string
  name: string
  isPublic: boolean
  userId: string
  modelResourceId: string
  thumbnailResourceId: string
  identifierName: string
  modelResource?: StaticResourceInterface
  thumbnailResource?: StaticResourceInterface
  project?: string
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
  if (user['user-api-key'] && user['user-api-key'].id) {
    returned = {
      ...returned,
      apiKey: user['user-api-key']
    }
  }

  // console.log('Returned user:')
  // console.log(returned)
  return returned
}

export function resolveWalletUser(credentials: any): UserInterface {
  return {
    id: '' as UserId,
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
