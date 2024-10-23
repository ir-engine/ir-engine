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
import { StringEnum, Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'

export const engineSettingPath = 'engine-setting'

export const engineSettingMethods = ['find', 'create', 'patch', 'remove'] as const

// Main data model schema
export const engineSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    key: Type.String(),
    value: Type.String(),
    type: StringEnum(['private', 'public']),
    category: StringEnum(['aws', 'server', 'task-server', 'chargebee', 'coil', 'zendesk', 'redis', 'metabase']),
    updatedBy: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    updatedAt: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'EngineSetting', additionalProperties: false }
)
export interface EngineSettingType extends Static<typeof engineSettingSchema> {}

// Schema for creating new entries
export const engineSettingDataSchema = Type.Pick(engineSettingSchema, ['key', 'value', 'type', 'category'], {
  $id: 'EngineSettingData'
})
export interface EngineSettingData extends Static<typeof engineSettingDataSchema> {}

// Schema for updating existing entries
export const engineSettingPatchSchema = Type.Partial(
  Type.Pick(engineSettingSchema, ['key', 'value', 'type', 'category']),
  {
    $id: 'EngineSettingPatch'
  }
)
export interface EngineSettingPatch extends Static<typeof engineSettingPatchSchema> {}

// Schema for allowed query properties
export const engineSettingQueryProperties = Type.Pick(engineSettingSchema, ['id', 'key', 'value', 'type', 'category'])
export const engineSettingQuerySchema = Type.Intersect(
  [
    querySyntax(engineSettingQueryProperties),
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
export interface EngineSettingQuery extends Static<typeof engineSettingQuerySchema> {}

export const engineSettingValidator = /* @__PURE__ */ getValidator(engineSettingSchema, dataValidator)
export const engineSettingDataValidator = /* @__PURE__ */ getValidator(engineSettingDataSchema, dataValidator)
export const engineSettingPatchValidator = /* @__PURE__ */ getValidator(engineSettingPatchSchema, dataValidator)
export const engineSettingQueryValidator = /* @__PURE__ */ getValidator(engineSettingQuerySchema, queryValidator)
