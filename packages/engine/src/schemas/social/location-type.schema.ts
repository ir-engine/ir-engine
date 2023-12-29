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

export const locationTypePath = 'location-type'

export const locationTypeMethods = ['find', 'get'] as const

// Main data model schema
export const locationTypeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'LocationType', additionalProperties: false }
)
export interface LocationTypeType extends Static<typeof locationTypeSchema> {}

// Schema for creating new entries
export const locationTypeDataSchema = Type.Pick(locationTypeSchema, ['type'], {
  $id: 'LocationTypeData'
})
export interface LocationTypeData extends Static<typeof locationTypeDataSchema> {}

// Schema for updating existing entries
export const locationTypePatchSchema = Type.Partial(locationTypeSchema, {
  $id: 'LocationTypePatch'
})
export interface LocationTypePatch extends Static<typeof locationTypePatchSchema> {}

// Schema for allowed query properties
export const locationTypeQueryProperties = Type.Pick(locationTypeSchema, ['type'])
export const locationTypeQuerySchema = Type.Intersect(
  [
    querySyntax(locationTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface LocationTypeQuery extends Static<typeof locationTypeQuerySchema> {}
