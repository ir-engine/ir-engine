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
import { dataValidator, queryValidator } from '../validators'

export const instancePath = 'instance'

export const instanceMethods = ['find', 'create', 'patch', 'remove', 'get'] as const

// Main data model schema
export const instanceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    ipAddress: Type.Optional(Type.String()),
    channelId: Type.Optional(
      Type.String({
        format: 'uuid'
      })
    ),
    currentUsers: Type.Integer(),
    podName: Type.String(),
    ended: Type.Boolean(),
    locationId: Type.Optional(
      Type.String({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Instance', additionalProperties: false }
)
export type InstanceType = Static<typeof instanceSchema>

// Schema for creating new entries
export const instanceDataSchema = Type.Pick(
  instanceSchema,
  ['ipAddress', 'channelId', 'currentUsers', 'podName', 'ended', 'locationId'],
  {
    $id: 'InstanceData'
  }
)
export type InstanceData = Static<typeof instanceDataSchema>

// Schema for updating existing entries
export const instancePatchSchema = Type.Partial(instanceSchema, {
  $id: 'InstancePatch'
})
export type InstancePatch = Static<typeof instancePatchSchema>

// Schema for allowed query properties
export const instanceQueryProperties = Type.Pick(instanceSchema, [
  'id',
  'ipAddress',
  'channelId',
  'currentUsers',
  'podName',
  'ended',
  'locationId'
])
export const instanceQuerySchema = Type.Intersect(
  [
    querySyntax(instanceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InstanceQuery = Static<typeof instanceQuerySchema>

export const instanceValidator = getValidator(instanceSchema, dataValidator)
export const instanceDataValidator = getValidator(instanceDataSchema, dataValidator)
export const instancePatchValidator = getValidator(instancePatchSchema, dataValidator)
export const instanceQueryValidator = getValidator(instanceQuerySchema, queryValidator)
