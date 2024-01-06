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
import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedRecord, TypedString } from '../../types/TypeboxUtils'
import { staticResourceSchema } from '../media/static-resource.schema'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const recordingPath = 'recording'

export const recordingMethods = ['get', 'find', 'create', 'patch', 'remove'] as const

export type RecordingID = OpaqueType<'RecordingID'> & string

export const recordingSchemaType = Type.Object(
  {
    user: Type.Array(Type.String()),
    peers: TypedRecord(TypedString<PeerID>({ format: 'uuid' }), Type.Array(TypedString<DataChannelType>()))
  },
  { $id: 'RecordingSchema', additionalProperties: false }
)
export interface RecordingSchemaType extends Static<typeof recordingSchemaType> {}

// Main data model schema
export const recordingSchema = Type.Object(
  {
    id: TypedString<RecordingID>({
      format: 'uuid'
    }),
    ended: Type.Boolean(),
    schema: Type.Ref(recordingSchemaType),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    resources: Type.Array(Type.Ref(staticResourceSchema)),
    userName: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Recording', additionalProperties: false }
)
export interface RecordingType extends Static<typeof recordingSchema> {}

export interface RecordingDatabaseType extends Omit<RecordingType, 'schema'> {
  schema: string
}

// Schema for creating new entries
export const recordingDataSchema = Type.Partial(recordingSchema, {
  $id: 'RecordingData'
})
export interface RecordingData extends Static<typeof recordingDataSchema> {}

// Schema for updating existing entries
export const recordingPatchSchema = Type.Partial(recordingSchema, {
  $id: 'RecordingPatch'
})
export interface RecordingPatch extends Static<typeof recordingPatchSchema> {}

// Schema for allowed query properties
export const recordingQueryProperties = Type.Pick(recordingSchema, ['id', 'userId'])
export const recordingQuerySchema = Type.Intersect(
  [
    querySyntax(recordingQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface RecordingQuery extends Static<typeof recordingQuerySchema> {}

export const recordingSchemaValidator = /* @__PURE__ */ getValidator(recordingSchemaType, dataValidator)
export const recordingValidator = /* @__PURE__ */ getValidator(recordingSchema, dataValidator)
export const recordingDataValidator = /* @__PURE__ */ getValidator(recordingDataSchema, dataValidator)
export const recordingPatchValidator = /* @__PURE__ */ getValidator(recordingPatchSchema, dataValidator)
export const recordingQueryValidator = /* @__PURE__ */ getValidator(recordingQuerySchema, queryValidator)
