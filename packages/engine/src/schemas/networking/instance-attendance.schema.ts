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
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { InstanceID } from './instance.schema'

export const instanceAttendancePath = 'instance-attendance'

export const instanceAttendanceMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const instanceAttendanceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    sceneId: Type.String(),
    isChannel: Type.Boolean(),
    ended: Type.Boolean(),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    instance: Type.Any(), // TODO: Replace any with instance schema once instance service is moved to feathers 5.
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'InstanceAttendance', additionalProperties: false }
)
export type InstanceAttendanceType = Static<typeof instanceAttendanceSchema>

// Schema for creating new entries
export const instanceAttendanceDataSchema = Type.Pick(
  instanceAttendanceSchema,
  ['sceneId', 'isChannel', 'ended', 'instanceId', 'userId'],
  {
    $id: 'InstanceAttendanceData'
  }
)
export type InstanceAttendanceData = Static<typeof instanceAttendanceDataSchema>

// Schema for updating existing entries
export const instanceAttendancePatchSchema = Type.Partial(instanceAttendanceSchema, {
  $id: 'InstanceAttendancePatch'
})
export type InstanceAttendancePatch = Static<typeof instanceAttendancePatchSchema>

// Schema for allowed query properties
export const instanceAttendanceQueryProperties = Type.Pick(instanceAttendanceSchema, [
  'id',
  'sceneId',
  'isChannel',
  'ended',
  'instanceId',
  'userId'
])
export const instanceAttendanceQuerySchema = Type.Intersect(
  [
    querySyntax(instanceAttendanceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InstanceAttendanceQuery = Static<typeof instanceAttendanceQuerySchema>

export const instanceAttendanceValidator = getValidator(instanceAttendanceSchema, dataValidator)
export const instanceAttendanceDataValidator = getValidator(instanceAttendanceDataSchema, dataValidator)
export const instanceAttendancePatchValidator = getValidator(instanceAttendancePatchSchema, dataValidator)
export const instanceAttendanceQueryValidator = getValidator(instanceAttendanceQuerySchema, queryValidator)
