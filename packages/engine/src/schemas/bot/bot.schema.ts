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
import { InstanceID, instanceSchema } from '../networking/instance.schema'
import { locationSchema } from '../social/location.schema'
import { dataValidator, queryValidator } from '../validators'
import { botCommandDataSchema } from './bot-command.schema'

export const botPath = 'bot'

export const botMethods = ['create', 'find', 'patch', 'remove'] as const

// Main data model schema
export const botSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    description: Type.String(),
    instanceId: TypedString<InstanceID>({
      format: 'uuid'
    }),
    locationId: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    botCommands: Type.Array(Type.Ref(botCommandDataSchema)),
    location: Type.Ref(locationSchema),
    instance: Type.Ref(instanceSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Bot', additionalProperties: false }
)
export type BotType = Static<typeof botSchema>

// Schema for creating new entries
export const botDataSchema = Type.Pick(
  botSchema,
  ['name', 'description', 'instanceId', 'locationId', 'userId', 'botCommands'],
  {
    $id: 'BotData'
  }
)
export type BotData = Static<typeof botDataSchema>

// Schema for updating existing entries
export const botPatchSchema = Type.Partial(botSchema, {
  $id: 'BotPatch'
})
export type BotPatch = Static<typeof botPatchSchema>

// Schema for allowed query properties
export const botQueryProperties = Type.Pick(botSchema, [
  'id',
  'name',
  'description',
  'instanceId',
  'locationId',
  'userId'
])
export const botQuerySchema = Type.Intersect(
  [
    querySyntax(botQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type BotQuery = Static<typeof botQuerySchema>

export const botValidator = getValidator(botSchema, dataValidator)
export const botDataValidator = getValidator(botDataSchema, dataValidator)
export const botPatchValidator = getValidator(botPatchSchema, dataValidator)
export const botQueryValidator = getValidator(botQuerySchema, queryValidator)
