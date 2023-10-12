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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { identityProviderTypes } from '../user/identity-provider.schema'
import { UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { inviteTypes } from './invite-type.schema'

export const invitePath = 'invite'

export const inviteMethods = ['create', 'find', 'remove', 'patch', 'get'] as const

export const spawnDetailsSchema = Type.Object(
  {
    inviteCode: Type.Optional(Type.String()),
    spawnPoint: Type.Optional(Type.String()),
    spectate: Type.Optional(Type.String())
  },
  { $id: 'SpawnDetails', additionalProperties: false }
)
export type SpawnDetailsType = Static<typeof spawnDetailsSchema>

// Main data model schema
export const inviteSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.Optional(Type.String()),
    identityProviderType: Type.Optional(StringEnum(identityProviderTypes)),
    passcode: Type.Optional(Type.String()),
    targetObjectId: Type.Optional(Type.String()),
    deleteOnUse: Type.Optional(Type.Boolean()),
    makeAdmin: Type.Optional(Type.Boolean()),
    spawnType: Type.Optional(Type.String()),
    spawnDetails: Type.Optional(Type.Ref(spawnDetailsSchema)),
    timed: Type.Optional(Type.Boolean()),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    inviteeId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    inviteType: StringEnum(inviteTypes),
    user: Type.Optional(Type.Ref(userSchema)),
    invitee: Type.Optional(Type.Ref(userSchema)),
    channelName: Type.Optional(Type.String()),
    startTime: Type.Optional(Type.String({ format: 'date-time' })),
    endTime: Type.Optional(Type.String({ format: 'date-time' })),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Invite', additionalProperties: false }
)
export type InviteType = Static<typeof inviteSchema>

export type InviteDatabaseType = Omit<InviteType, 'spawnDetails'> & { spawnDetails: string }

// Schema for creating new entries
export const inviteDataProperties = Type.Pick(
  inviteSchema,
  [
    'token',
    'identityProviderType',
    'passcode',
    'targetObjectId',
    'deleteOnUse',
    'makeAdmin',
    'spawnType',
    'spawnDetails',
    'timed',
    'inviteeId',
    'inviteType',
    'startTime',
    'endTime'
  ],
  {
    $id: 'InviteData'
  }
)
export const inviteDataSchema = Type.Intersect(
  [
    inviteDataProperties,
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InviteData = Static<typeof inviteDataSchema>

// Schema for updating existing entries
export const invitePatchSchema = Type.Partial(inviteDataSchema, {
  $id: 'InvitePatch'
})
export type InvitePatch = Static<typeof invitePatchSchema>

// Schema for allowed query properties
export const inviteQueryProperties = Type.Pick(inviteSchema, [
  'id',
  'token',
  'identityProviderType',
  'passcode',
  'targetObjectId',
  'deleteOnUse',
  'makeAdmin',
  'spawnType',
  'timed',
  'userId'
])
export const inviteQuerySchema = Type.Intersect(
  [
    querySyntax(inviteQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        type: Type.Optional(StringEnum(['received', 'sent'])),
        search: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type InviteQuery = Static<typeof inviteQuerySchema>

export const spawnDetailsValidator = getValidator(spawnDetailsSchema, dataValidator)
export const inviteValidator = getValidator(inviteSchema, dataValidator)
export const inviteDataValidator = getValidator(inviteDataSchema, dataValidator)
export const invitePatchValidator = getValidator(invitePatchSchema, dataValidator)
export const inviteQueryValidator = getValidator(inviteQuerySchema, queryValidator)
