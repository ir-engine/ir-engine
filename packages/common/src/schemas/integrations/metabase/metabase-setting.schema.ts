/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators'

export const metabaseSettingPath = 'metabase-setting'

export const metabaseSettingMethods = ['find', 'create', 'patch'] as const

// Main data model schema
export const metabaseSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    siteUrl: Type.String(),
    secretKey: Type.String(),
    environment: Type.String(),
    crashDashboardId: Type.Optional(Type.String()),
    expiration: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MetabaseSetting', additionalProperties: true }
)
export interface MetabaseSettingType extends Static<typeof metabaseSettingSchema> {}

// Schema for creating new entries
export const metabaseSettingDataSchema = Type.Pick(
  metabaseSettingSchema,
  ['siteUrl', 'secretKey', 'crashDashboardId'],
  {
    $id: 'MetabaseSettingData'
  }
)
export interface MetabaseSettingData extends Static<typeof metabaseSettingDataSchema> {}

// Schema for updating existing entries
export const metabaseSettingPatchSchema = Type.Partial(metabaseSettingSchema, {
  $id: 'MetabaseSettingPatch'
})
export interface MetabaseSettingPatch extends Static<typeof metabaseSettingPatchSchema> {}

// Schema for allowed query properties
export const metabaseSettingQueryProperties = Type.Pick(metabaseSettingSchema, [
  'id',
  'siteUrl',
  'secretKey',
  'environment',
  'crashDashboardId'
])

export const metabaseSettingQuerySchema = Type.Intersect(
  [
    querySyntax(metabaseSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: true })
  ],
  { additionalProperties: true }
)
export interface MetabaseSettingQuery extends Static<typeof metabaseSettingQuerySchema> {}

export const metabaseSettingValidator = /* @__PURE__ */ getValidator(metabaseSettingSchema, dataValidator)
export const metabaseSettingDataValidator = /* @__PURE__ */ getValidator(metabaseSettingDataSchema, dataValidator)
export const metabaseSettingPatchValidator = /* @__PURE__ */ getValidator(metabaseSettingPatchSchema, dataValidator)
export const metabaseSettingQueryValidator = /* @__PURE__ */ getValidator(metabaseSettingQuerySchema, queryValidator)
