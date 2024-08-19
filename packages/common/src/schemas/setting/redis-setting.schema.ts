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

export const redisSettingPath = 'redis-setting'

export const redisSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const redisSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    enabled: Type.Boolean(),
    address: Type.String(),
    port: Type.String(),
    password: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'RedisSetting', additionalProperties: false }
)
export interface RedisSettingType extends Static<typeof redisSettingSchema> {}

// Schema for creating new entries
export const redisSettingDataSchema = Type.Pick(redisSettingSchema, ['enabled', 'address', 'port', 'password'], {
  $id: 'RedisSettingData'
})
export interface RedisSettingData extends Static<typeof redisSettingDataSchema> {}

// Schema for updating existing entries
export const redisSettingPatchSchema = Type.Partial(redisSettingSchema, {
  $id: 'RedisSettingPatch'
})
export interface RedisSettingPatch extends Static<typeof redisSettingPatchSchema> {}

// Schema for allowed query properties
export const redisSettingQueryProperties = Type.Pick(redisSettingSchema, [
  'id',
  'enabled',
  'address',
  'port',
  'password'
])
export const redisSettingQuerySchema = Type.Intersect(
  [
    querySyntax(redisSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface RedisSettingQuery extends Static<typeof redisSettingQuerySchema> {}

export const redisSettingValidator = /* @__PURE__ */ getValidator(redisSettingSchema, dataValidator)
export const redisSettingDataValidator = /* @__PURE__ */ getValidator(redisSettingDataSchema, dataValidator)
export const redisSettingPatchValidator = /* @__PURE__ */ getValidator(redisSettingPatchSchema, dataValidator)
export const redisSettingQueryValidator = /* @__PURE__ */ getValidator(redisSettingQuerySchema, queryValidator)
