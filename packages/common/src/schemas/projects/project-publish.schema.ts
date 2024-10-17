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

import { TypedString } from '../../types/TypeboxUtils'
import { locationDataSchema } from '../social/location.schema'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const projectPublishPath = 'project-publish'

export const projectPublishMethods = ['get', 'find', 'create', 'patch', 'remove', 'update'] as const

// Main data model schema
export const projectPublishSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectPublish', additionalProperties: false }
)
export interface ProjectPublishType extends Static<typeof projectPublishSchema> {}

// Schema for creating new entries
export const projectPublishDataSchema = Type.Intersect(
  [
    Type.Pick(projectPublishSchema, ['projectId', 'updatedAt']),
    Type.Object({ locations: Type.Optional(Type.Array(Type.Ref(locationDataSchema))) }, { additionalProperties: false })
  ],
  { $id: 'ProjectPublishData' }
)
export interface ProjectPublishData extends Static<typeof projectPublishDataSchema> {}

// Schema for updating existing entries
export const projectPublishPatchSchema = Type.Partial(projectPublishSchema, {
  $id: 'ProjectPublishPatch'
})
export interface ProjectPublishPatch extends Static<typeof projectPublishPatchSchema> {}

// Schema for allowed query properties
export const projectPublishQueryProperties = Type.Pick(projectPublishSchema, [
  'id',
  'projectId',
  'updatedBy',
  'updatedAt'
])
export const projectPublishQuerySchema = Type.Intersect(
  [querySyntax(projectPublishQueryProperties, {})],
  // Add additional query properties here
  { additionalProperties: false }
)
export interface ProjectPublishQuery extends Static<typeof projectPublishQuerySchema> {}

export const projectPublishValidator = /* @__PURE__ */ getValidator(projectPublishSchema, dataValidator)
export const projectPublishDataValidator = /* @__PURE__ */ getValidator(projectPublishDataSchema, dataValidator)
export const projectPublishPatchValidator = /* @__PURE__ */ getValidator(projectPublishPatchSchema, dataValidator)
export const projectPublishQueryValidator = /* @__PURE__ */ getValidator(projectPublishQuerySchema, queryValidator)
