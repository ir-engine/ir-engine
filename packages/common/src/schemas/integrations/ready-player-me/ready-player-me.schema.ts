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

import { getValidator, Static, StringEnum, Type } from '@feathersjs/typebox'
import { TypedString } from '../../../types/TypeboxUtils'
import { UserID } from '../../user/user.schema'
import { dataValidator } from '../../validators'

export const readyPlayerMeAccountPath = 'ready-player-me-account'

export const readyPlayerMeAccountMethods = ['get', 'patch'] as const

export const ReadyPlayerMeAccountSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    type: StringEnum(['linked', 'guest']),
    token: Type.Optional(Type.String()),
    readyPlayerMeUserId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ReadyPlayerMeAccount', additionalProperties: false }
)
export interface ReadyPlayerMeAccountType extends Static<typeof ReadyPlayerMeAccountSchema> {}

export interface ReadyPlayerMeAccountDatabaseType extends Omit<ReadyPlayerMeAccountType, 'token'> {}

export const ReadyPlayerMeAccountDataSchema = Type.Pick(ReadyPlayerMeAccountSchema, ['type', 'readyPlayerMeUserId'], {
  $id: 'readyPlayerMeAccountData'
})
export interface ReadyPlayerMeAccountData extends Static<typeof ReadyPlayerMeAccountDataSchema> {}

export const readyPlayerMeAccountDataValidator = /* @__PURE__ */ getValidator(
  ReadyPlayerMeAccountDataSchema,
  dataValidator
)
