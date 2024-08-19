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

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { TypedString } from '../../types/TypeboxUtils'
import { InstanceID } from '../networking/instance.schema'
import { UserID, userSchema } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { ChannelID } from './channel.schema'

export const messagePath = 'message'

export const messageMethods = ['create', 'find'] as const
export type MessageID = OpaqueType<'MessageID'> & string

// Main data model schema
export const messageSchema = Type.Object(
  {
    id: TypedString<MessageID>({
      format: 'uuid'
    }),
    text: Type.String(),
    isNotification: Type.Boolean(),
    channelId: TypedString<ChannelID>({
      format: 'uuid'
    }),
    senderId: TypedString<UserID>({
      format: 'uuid'
    }),
    sender: Type.Ref(userSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Message' as MessageID, additionalProperties: false }
)
export interface MessageType extends Static<typeof messageSchema> {}

// Schema for creating new entries
export const messageDataProperties = Type.Partial(messageSchema)

export const messageDataSchema = Type.Intersect(
  [
    messageDataProperties,
    Type.Object({
      instanceId: Type.Optional(
        TypedString<InstanceID>({
          format: 'uuid'
        })
      )
    })
  ],
  {
    $id: 'MessageData',
    additionalProperties: false
  }
)
export interface MessageData extends Static<typeof messageDataSchema> {}

// Schema for updating existing entries
export const messagePatchSchema = Type.Partial(messageSchema, {
  $id: 'MessagePatch'
})
export interface MessagePatch extends Static<typeof messagePatchSchema> {}

// Schema for allowed query properties
export const messageQueryProperties = Type.Pick(messageSchema, [
  'id',
  'text',
  'isNotification',
  'channelId',
  'senderId',
  'createdAt'
])
export const messageQuerySchema = Type.Intersect(
  [
    querySyntax(messageQueryProperties, {}),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MessageQuery extends Static<typeof messageQuerySchema> {}

export const messageValidator = /* @__PURE__ */ getValidator(messageSchema, dataValidator)
export const messageDataValidator = /* @__PURE__ */ getValidator(messageDataSchema, dataValidator)
export const messagePatchValidator = /* @__PURE__ */ getValidator(messagePatchSchema, dataValidator)
export const messageQueryValidator = /* @__PURE__ */ getValidator(messageQuerySchema, queryValidator)
