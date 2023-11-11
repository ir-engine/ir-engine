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

import { Static, Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { instanceAttendanceSchema } from '../networking/instance-attendance.schema'
import { InviteCode, UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const inviteCodeLookupPath = 'invite-code-lookup'

export const inviteCodeLookupMethods = ['find'] as const

// Main data model schema
export const inviteCodeLookupSchema = Type.Object(
  {
    id: TypedString<UserID>({
      format: 'uuid'
    }),
    inviteCode: TypedString<InviteCode>({
      format: 'uuid'
    }),
    instanceAttendance: Type.Array(Type.Ref(instanceAttendanceSchema))
  },
  { $id: 'InviteCodeLookup', additionalProperties: false }
)
export interface InviteCodeLookupType extends Static<typeof inviteCodeLookupSchema> {}

// Schema for allowed query properties
export const inviteCodeLookupQueryProperties = Type.Pick(inviteCodeLookupSchema, ['inviteCode'])
export const inviteCodeLookupQuerySchema = Type.Intersect(
  [
    querySyntax(inviteCodeLookupQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface InviteCodeLookupQuery extends Static<typeof inviteCodeLookupQuerySchema> {}

export const inviteCodeLookupValidator = getValidator(inviteCodeLookupSchema, dataValidator)
export const inviteCodeLookupQueryValidator = getValidator(inviteCodeLookupQuerySchema, queryValidator)
