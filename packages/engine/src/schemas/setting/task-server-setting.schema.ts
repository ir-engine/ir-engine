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

export const taskServerSettingPath = 'task-server-setting'

export const taskServerSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const taskServerSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    port: Type.String(),
    processInterval: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'TaskServerSetting', additionalProperties: false }
)
export type TaskServerSettingType = Static<typeof taskServerSettingSchema>

// Schema for creating new entries
export const taskServerSettingDataSchema = Type.Pick(taskServerSettingSchema, ['port', 'processInterval'], {
  $id: 'TaskServerSettingData'
})
export type TaskServerSettingData = Static<typeof taskServerSettingDataSchema>

// Schema for updating existing entries
export const taskServerSettingPatchSchema = Type.Partial(taskServerSettingSchema, {
  $id: 'TaskServerSettingPatch'
})
export type TaskServerSettingPatch = Static<typeof taskServerSettingPatchSchema>

// Schema for allowed query properties
export const taskServerSettingQueryProperties = Type.Pick(taskServerSettingSchema, ['id', 'port', 'processInterval'])
export const taskServerSettingQuerySchema = Type.Intersect(
  [
    querySyntax(taskServerSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type TaskServerSettingQuery = Static<typeof taskServerSettingQuerySchema>
