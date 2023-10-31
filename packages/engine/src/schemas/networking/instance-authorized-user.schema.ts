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
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { InstanceID } from './instance.schema'

export const instanceAuthorizedUserPath = 'instance-authorized-user'

export const instanceAuthorizedUserMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const instanceAuthorizedUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'InstanceAuthorizedUser', additionalProperties: false }
)
export interface InstanceAuthorizedUserType extends Static<typeof instanceAuthorizedUserSchema> {}

// Schema for creating new entries
export const instanceAuthorizedUserDataSchema = Type.Pick(instanceAuthorizedUserSchema, ['userId', 'instanceId'], {
  $id: 'InstanceAuthorizedUserData'
})
export interface InstanceAuthorizedUserData extends Static<typeof instanceAuthorizedUserDataSchema> {}

// Schema for updating existing entries
export const instanceAuthorizedUserPatchSchema = Type.Partial(instanceAuthorizedUserSchema, {
  $id: 'InstanceAuthorizedUserPatch'
})
export interface InstanceAuthorizedUserPatch extends Static<typeof instanceAuthorizedUserPatchSchema> {}

// Schema for allowed query properties
export const instanceAuthorizedUserQueryProperties = Type.Pick(instanceAuthorizedUserSchema, [
  'id',
  'userId',
  'instanceId'
])
export const instanceAuthorizedUserQuerySchema = Type.Intersect(
  [
    querySyntax(instanceAuthorizedUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface InstanceAuthorizedUserQuery extends Static<typeof instanceAuthorizedUserQuerySchema> {}

export const instanceAuthorizedUserValidator = getValidator(instanceAuthorizedUserSchema, dataValidator)
export const instanceAuthorizedUserDataValidator = getValidator(instanceAuthorizedUserDataSchema, dataValidator)
export const instanceAuthorizedUserPatchValidator = getValidator(instanceAuthorizedUserPatchSchema, dataValidator)
export const instanceAuthorizedUserQueryValidator = getValidator(instanceAuthorizedUserQuerySchema, queryValidator)
