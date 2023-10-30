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
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { TypedString } from '../../common/types/TypeboxUtils'
import { staticResourceSchema } from '../media/static-resource.schema'
import { dataValidator, queryValidator } from '../validators'

export const avatarPath = 'avatar'

export const avatarMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const avatarSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    identifierName: Type.String(),
    modelResourceId: Type.String({
      format: 'uuid'
    }),
    thumbnailResourceId: Type.String({
      format: 'uuid'
    }),
    isPublic: Type.Boolean(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    project: Type.String(),
    user: Type.Optional(Type.Any()), // avoid circular reference to `userSchema` which utilizes current `avatarSchema`
    modelResource: Type.Optional(Type.Ref(staticResourceSchema)),
    thumbnailResource: Type.Optional(Type.Ref(staticResourceSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Avatar', additionalProperties: false }
)
export interface AvatarType extends Static<typeof avatarSchema> {}

export interface AvatarDatabaseType extends Omit<AvatarType, 'user' | 'modelResource' | 'thumbnailResource'> {}

// Schema for creating new entries
// export const avatarDataSchema = Type.Pick(
//   avatarSchema,
//   ['name', 'identifierName', 'modelResourceId', 'thumbnailResourceId', 'isPublic', 'userId', 'project'],
//   {
//     $id: 'AvatarData'
//   }
// )
export const avatarDataSchema = Type.Partial(avatarSchema, {
  $id: 'AvatarData'
})
export interface AvatarData extends Static<typeof avatarDataSchema> {}

// Schema for updating existing entries
export const avatarPatchSchema = Type.Partial(avatarSchema, {
  $id: 'AvatarPatch'
})
export interface AvatarPatch extends Static<typeof avatarPatchSchema> {}

// Schema for allowed query properties
export const avatarQueryProperties = Type.Pick(avatarSchema, [
  'id',
  'name',
  'identifierName',
  'modelResourceId',
  'thumbnailResourceId',
  'isPublic',
  'userId',
  'project'
])
export const avatarQuerySchema = Type.Intersect(
  [
    querySyntax(avatarQueryProperties, {
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object({ action: Type.Optional(Type.String()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface AvatarQuery extends Static<typeof avatarQuerySchema> {}

export const avatarValidator = getValidator(avatarSchema, dataValidator)
export const avatarDataValidator = getValidator(avatarDataSchema, dataValidator)
export const avatarPatchValidator = getValidator(avatarPatchSchema, dataValidator)
export const avatarQueryValidator = getValidator(avatarQuerySchema, queryValidator)
