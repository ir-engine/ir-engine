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

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const staticResourceTypePath = 'static-resource-type'

export const staticResourceTypeMethods = ['find', 'get'] as const

export type StaticResourceTypes = 'asset' | 'scene' | 'avatar' | 'recording'

// Main data model schema
export const staticResourceTypeSchema = Type.Object(
  {
    type: TypedString<StaticResourceTypes>(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'StaticResourceType', additionalProperties: false }
)
export interface StaticResourceTypeType extends Static<typeof staticResourceTypeSchema> {}

// Schema for creating new entries
export const staticResourceTypeDataSchema = Type.Pick(staticResourceTypeSchema, ['type'], {
  $id: 'StaticResourceTypeData'
})
export interface StaticResourceTypeData extends Static<typeof staticResourceTypeDataSchema> {}

// Schema for updating existing entries
export const staticResourceTypePatchSchema = Type.Partial(staticResourceTypeSchema, {
  $id: 'StaticResourceTypePatch'
})
export interface StaticResourceTypePatch extends Static<typeof staticResourceTypePatchSchema> {}

// Schema for allowed query properties
export const staticResourceTypeQueryProperties = Type.Pick(staticResourceTypeSchema, ['type'])
export const staticResourceTypeQuerySchema = Type.Intersect(
  [
    querySyntax(staticResourceTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface StaticResourceTypeQuery extends Static<typeof staticResourceTypeQuerySchema> {}

export const staticResourceTypeValidator = /* @__PURE__ */ getValidator(staticResourceTypeSchema, dataValidator)
export const staticResourceTypeDataValidator = /* @__PURE__ */ getValidator(staticResourceTypeDataSchema, dataValidator)
export const staticResourceTypePatchValidator = /* @__PURE__ */ getValidator(
  staticResourceTypePatchSchema,
  dataValidator
)
export const staticResourceTypeQueryValidator = /* @__PURE__ */ getValidator(
  staticResourceTypeQuerySchema,
  queryValidator
)
