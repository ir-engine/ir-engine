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
import { querySyntax, Type } from '@feathersjs/typebox'

// TODO: This is temporary variable. It will be removed once this service is moved to feathers 5.
export const locationAuthorizedUserDBPath = 'location_authorized_user'

// Main data model schema
export const locationAuthorizedUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: Type.String({
      format: 'uuid'
    }),
    locationId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LocationAuthorizedUser', additionalProperties: false }
)
export type LocationAuthorizedUserType = Static<typeof locationAuthorizedUserSchema>

// Schema for creating new entries
export const locationAuthorizedUserDataSchema = Type.Pick(locationAuthorizedUserSchema, ['userId', 'locationId'], {
  $id: 'LocationAuthorizedUserData'
})
export type LocationAuthorizedUserData = Static<typeof locationAuthorizedUserDataSchema>

// Schema for updating existing entries
export const locationAuthorizedUserPatchSchema = Type.Partial(locationAuthorizedUserSchema, {
  $id: 'LocationAuthorizedUserPatch'
})
export type LocationAuthorizedUserPatch = Static<typeof locationAuthorizedUserPatchSchema>

// Schema for allowed query properties
export const locationAuthorizedUserQueryProperties = Type.Pick(locationAuthorizedUserSchema, [
  'id',
  'userId',
  'locationId'
])
export const locationAuthorizedUserQuerySchema = Type.Intersect(
  [
    querySyntax(locationAuthorizedUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)

export type LocationAuthorizedUserQuery = Static<typeof locationAuthorizedUserQuerySchema>
