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
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const featureFlagSettingPath = 'feature-flag-setting'

export const featureFlagSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const featureFlagSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    flagName: Type.String(),
    flagValue: Type.Boolean(),
    userId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'FeatureFlagSetting', additionalProperties: false }
)
export interface FeatureFlagSettingType extends Static<typeof featureFlagSettingSchema> {}

// Schema for creating new entries
export const featureFlagSettingDataSchema = Type.Pick(featureFlagSettingSchema, ['flagName', 'flagValue', 'userId'], {
  $id: 'FeatureFlagSettingData'
})
export interface FeatureFlagSettingData extends Static<typeof featureFlagSettingDataSchema> {}

// Schema for updating existing entries
export const featureFlagSettingPatchSchema = Type.Partial(featureFlagSettingSchema, {
  $id: 'FeatureFlagSettingPatch'
})
export interface FeatureFlagSettingPatch extends Static<typeof featureFlagSettingPatchSchema> {}

// Schema for allowed query properties
export const featureFlagSettingQueryProperties = Type.Pick(featureFlagSettingSchema, ['id', 'flagName', 'flagValue'])
export const featureFlagSettingQuerySchema = Type.Intersect(
  [
    querySyntax(featureFlagSettingQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface FeatureFlagSettingQuery extends Static<typeof featureFlagSettingQuerySchema> {}

export const featureFlagSettingValidator = /* @__PURE__ */ getValidator(featureFlagSettingSchema, dataValidator)
export const featureFlagSettingDataValidator = /* @__PURE__ */ getValidator(featureFlagSettingDataSchema, dataValidator)
export const featureFlagSettingPatchValidator = /* @__PURE__ */ getValidator(
  featureFlagSettingPatchSchema,
  dataValidator
)
export const featureFlagSettingQueryValidator = /* @__PURE__ */ getValidator(
  featureFlagSettingQuerySchema,
  queryValidator
)
