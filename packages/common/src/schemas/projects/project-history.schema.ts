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
import { Static, StringEnum, Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'
import { TypedString } from '@ir-engine/common/src/types/TypeboxUtils'

export const projectHistoryPath = 'project-history'
export const projectHistoryMethods = ['create', 'find', 'remove'] as const

export const ActionTypes = [
  'SCENE_CREATED',
  'SCENE_RENAMED',
  'SCENE_MODIFIED',
  'SCENE_REMOVED',
  'RESOURCE_CREATED',
  'RESOURCE_RENAMED',
  'RESOURCE_MODIFIED',
  'RESOURCE_REMOVED',
  'PROJECT_CREATED',
  'PERMISSION_CREATED',
  'PERMISSION_MODIFIED',
  'PERMISSION_REMOVED',
  'LOCATION_PUBLISHED',
  'LOCATION_MODIFIED',
  'LOCATION_UNPUBLISHED',
  'TAGS_MODIFIED',
  'THUMBNAIL_CREATED',
  'THUMBNAIL_MODIFIED',
  'THUMBNAIL_REMOVED'
] as const

export type ActionType = (typeof ActionTypes)[number]

export const ActionIdentifierTypes = ['static-resource', 'project', 'location', 'project-permission'] as const

// Schema for creating new entries
export const projectHistorySchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: Type.Union([
      TypedString<UserID>({
        format: 'uuid'
      }),
      Type.Null()
    ]),

    userName: Type.String(),
    userAvatarURL: Type.String({ format: 'uri' }),

    // @ts-ignore
    action: StringEnum(ActionTypes),
    actionIdentifier: Type.String(),

    // @ts-ignore
    actionIdentifierType: StringEnum(ActionIdentifierTypes),
    actionDetail: Type.String(),

    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectHistory', additionalProperties: false }
)
export interface ProjectHistoryType extends Static<typeof projectHistorySchema> {}

// Schema for creating new entries
export const projectHistoryDataSchema = Type.Pick(
  projectHistorySchema,
  ['projectId', 'userId', 'action', 'actionIdentifier', 'actionIdentifierType', 'actionDetail'],
  {
    $id: 'ProjectHistoryData'
  }
)
export interface ProjectHistoryData extends Static<typeof projectHistoryDataSchema> {}

// Schema for allowed query properties
export const projectHistoryQueryProperties = Type.Pick(projectHistorySchema, ['projectId', 'createdAt'])

export const projectHistoryQuerySchema = Type.Intersect([querySyntax(projectHistoryQueryProperties, {})], {
  additionalProperties: false
})
export interface ProjectHistoryQuery extends Static<typeof projectHistoryQuerySchema> {}

export const projectHistoryValidator = /* @__PURE__ */ getValidator(projectHistorySchema, dataValidator)
export const projectHistoryDataValidator = /* @__PURE__ */ getValidator(projectHistoryDataSchema, dataValidator)
export const projectHistoryQueryValidator = /* @__PURE__ */ getValidator(projectHistoryQuerySchema, queryValidator)
