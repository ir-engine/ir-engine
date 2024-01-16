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
import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userKickPath = 'user-kick'

export const userKickMethods = ['find', 'create'] as const

export type UserKickID = OpaqueType<'UserKickID'> & string

// Main data model schema
export const userKickSchema = Type.Object(
  {
    id: TypedString<UserKickID>({
      format: 'uuid'
    }),
    duration: Type.String({ format: 'date-time' }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserKick', additionalProperties: false }
)
export interface UserKickType extends Static<typeof userKickSchema> {}

// Schema for creating new entries
export const userKickDataSchema = Type.Pick(userKickSchema, ['duration', 'userId', 'instanceId'], {
  $id: 'UserKickData'
})
export interface UserKickData extends Static<typeof userKickDataSchema> {}

// Schema for updating existing entries
export const userKickPatchSchema = Type.Partial(userKickSchema, {
  $id: 'UserKickPatch'
})
export interface UserKickPatch extends Static<typeof userKickPatchSchema> {}

// Schema for allowed query properties
export const userKickQueryProperties = Type.Pick(userKickSchema, ['id', 'duration', 'userId', 'instanceId'])
export const userKickQuerySchema = Type.Intersect(
  [
    querySyntax(userKickQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserKickQuery extends Static<typeof userKickQuerySchema> {}

export const userKickValidator = /* @__PURE__ */ getValidator(userKickSchema, dataValidator)
export const userKickDataValidator = /* @__PURE__ */ getValidator(userKickDataSchema, dataValidator)
export const userKickPatchValidator = /* @__PURE__ */ getValidator(userKickPatchSchema, dataValidator)
export const userKickQueryValidator = /* @__PURE__ */ getValidator(userKickQuerySchema, queryValidator)
