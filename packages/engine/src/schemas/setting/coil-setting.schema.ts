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

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const coilSettingPath = 'coil-setting'

export const coilSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const coilSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    paymentPointer: Type.String(),
    clientId: Type.String(),
    clientSecret: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'CoilSetting', additionalProperties: false }
)
export type CoilSettingType = Static<typeof coilSettingSchema>

// Schema for creating new entries
export const coilSettingDataSchema = Type.Pick(coilSettingSchema, ['paymentPointer', 'clientId', 'clientSecret'], {
  $id: 'CoilSettingData'
})
export type CoilSettingData = Static<typeof coilSettingDataSchema>

// Schema for updating existing entries
export const coilSettingPatchSchema = Type.Partial(coilSettingSchema, {
  $id: 'CoilSettingPatch'
})
export type CoilSettingPatch = Static<typeof coilSettingPatchSchema>

// Schema for allowed query properties
export const coilSettingQueryProperties = Type.Pick(coilSettingSchema, [
  'id',
  'paymentPointer',
  'clientId',
  'clientSecret'
])
export const coilSettingQuerySchema = Type.Intersect(
  [
    querySyntax(coilSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CoilSettingQuery = Static<typeof coilSettingQuerySchema>
