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

import { dataValidator, queryValidator } from '../validators'

export const helmSettingPath = 'helm-setting'
export const helmMainVersionPath = 'helm-main-version'
export const helmBuilderVersionPath = 'helm-builder-version'

export const helmSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const helmSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    main: Type.String(),
    builder: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'HelmSetting', additionalProperties: false }
)
export interface HelmSettingType extends Static<typeof helmSettingSchema> {}

// Schema for creating new entries
export const helmSettingDataSchema = Type.Pick(helmSettingSchema, ['main', 'builder'], {
  $id: 'HelmSettingData'
})
export interface HelmSettingData extends Static<typeof helmSettingDataSchema> {}

// Schema for updating existing entries
export const helmSettingPatchSchema = Type.Partial(helmSettingSchema, {
  $id: 'HelmSettingPatch'
})
export interface HelmSettingPatch extends Static<typeof helmSettingPatchSchema> {}

// Schema for allowed query properties
export const helmSettingQueryProperties = Type.Pick(helmSettingSchema, ['id'])
export const helmSettingQuerySchema = Type.Intersect(
  [
    querySyntax(helmSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface HelmSettingQuery extends Static<typeof helmSettingQuerySchema> {}

export const helmSettingValidator = /* @__PURE__ */ getValidator(helmSettingSchema, dataValidator)
export const helmSettingDataValidator = /* @__PURE__ */ getValidator(helmSettingDataSchema, dataValidator)
export const helmSettingPatchValidator = /* @__PURE__ */ getValidator(helmSettingPatchSchema, dataValidator)
export const helmSettingQueryValidator = /* @__PURE__ */ getValidator(helmSettingQuerySchema, queryValidator)
