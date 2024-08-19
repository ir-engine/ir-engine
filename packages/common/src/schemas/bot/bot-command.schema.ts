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

export const botCommandPath = 'bot-command'

export const botCommandMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const botCommandSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    description: Type.String(),
    botId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'BotCommand', additionalProperties: false }
)
export interface BotCommandType extends Static<typeof botCommandSchema> {}

// Schema for creating new entries
export const botCommandDataSchema = Type.Partial(botCommandSchema, {
  $id: 'BotCommandData'
})
export interface BotCommandData extends Static<typeof botCommandDataSchema> {}

// Schema for updating existing entries
export const botCommandPatchSchema = Type.Partial(botCommandSchema, {
  $id: 'BotCommandPatch'
})
export interface BotCommandPatch extends Static<typeof botCommandPatchSchema> {}

// Schema for allowed query properties
export const botCommandQueryProperties = Type.Pick(botCommandSchema, ['id', 'name', 'description', 'botId'])
export const botCommandQuerySchema = Type.Intersect(
  [
    querySyntax(botCommandQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface BotCommandQuery extends Static<typeof botCommandQuerySchema> {}

export const botCommandValidator = /* @__PURE__ */ getValidator(botCommandSchema, dataValidator)
export const botCommandDataValidator = /* @__PURE__ */ getValidator(botCommandDataSchema, dataValidator)
export const botCommandPatchValidator = /* @__PURE__ */ getValidator(botCommandPatchSchema, dataValidator)
export const botCommandQueryValidator = /* @__PURE__ */ getValidator(botCommandQuerySchema, queryValidator)
