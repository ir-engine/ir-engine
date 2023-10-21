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
import { LocationID } from './location.schema'

export const locationAdminPath = 'location-admin'

export const locationAdminMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const locationAdminSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    locationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LocationAdmin', additionalProperties: false }
)
export type LocationAdminType = Static<typeof locationAdminSchema>

// Schema for creating new entries
export const locationAdminDataSchema = Type.Pick(locationAdminSchema, ['userId', 'locationId'], {
  $id: 'LocationAdminData'
})
export type LocationAdminData = Static<typeof locationAdminDataSchema>

// Schema for updating existing entries
export const locationAdminPatchSchema = Type.Partial(locationAdminSchema, {
  $id: 'LocationAdminPatch'
})
export type LocationAdminPatch = Static<typeof locationAdminPatchSchema>

// Schema for allowed query properties
export const locationAdminQueryProperties = Type.Pick(locationAdminSchema, ['id', 'userId', 'locationId'])
export const locationAdminQuerySchema = Type.Intersect(
  [
    querySyntax(locationAdminQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

export type LocationAdminQuery = Static<typeof locationAdminQuerySchema>

export const locationAdminValidator = getValidator(locationAdminSchema, dataValidator)
export const locationAdminDataValidator = getValidator(locationAdminDataSchema, dataValidator)
export const locationAdminPatchValidator = getValidator(locationAdminPatchSchema, dataValidator)
export const locationAdminQueryValidator = getValidator(locationAdminQuerySchema, queryValidator)
