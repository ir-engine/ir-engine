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
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import { dataValidator, queryValidator } from '@etherealengine/common/src/schemas/validators'
import { TypedString } from '@etherealengine/common/src/types/TypeboxUtils'
import { Static, Type, getValidator, querySyntax } from '@feathersjs/typebox'

export const projectHistoryPath = 'project-history'
export const projectHistoryMethods = ['create', 'find', 'remove'] as const

export enum ActionTypes {
  CREATE_PROJECT = 'CREATE_PROJECT',
  UPDATE_PROJECT = 'UPDATE_PROJECT',
  COLLABORATER_ADDED = 'COLLABORATER_ADDED',
  COLLABORATER_REMOVED = 'COLLABORATER_REMOVED',

  CREATE_SCENE = 'CREATE_SCENE',
  UPDATE_SCENE = 'UPDATE_SCENE',
  REMOVE_SCENE = 'REMOVE_SCENE',
  CREATE_ASSET = 'CREATE_ASSET',
  UPDATE_ASSET = 'UPDATE_ASSET',
  REMOVE_ASSET = 'REMOVE_ASSET'
}

export const UserActionTypes = [ActionTypes.COLLABORATER_ADDED, ActionTypes.COLLABORATER_REMOVED]
export const ResourceActionTypes = [
  ActionTypes.CREATE_SCENE,
  ActionTypes.UPDATE_SCENE,
  ActionTypes.REMOVE_SCENE,
  ActionTypes.CREATE_ASSET,
  ActionTypes.UPDATE_ASSET,
  ActionTypes.REMOVE_ASSET
]
export const ProjectActionTypes = [ActionTypes.CREATE_PROJECT, ActionTypes.UPDATE_PROJECT]

// Schema for creating new entries
export const projectHistorySchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    projectId: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),

    userName: Type.String(),
    userAvatar: Type.String({ format: 'uri' }),

    action: Type.Enum(ActionTypes),
    actionIdentifier: Type.String(), // can be resourceId or userId or projectId
    actionResource: Type.String(), // can be assetURL or user name or project name

    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ProjectHistory', additionalProperties: false }
)
export interface ProjectHistoryType extends Static<typeof projectHistorySchema> {}

// Schema for creating new entries
export const projectHistoryDataSchema = Type.Pick(
  projectHistorySchema,
  ['projectId', 'userId', 'action', 'actionIdentifier'],
  {
    $id: 'ProjectHistoryData'
  }
)
export interface ProjectHistoryData extends Static<typeof projectHistoryDataSchema> {}

// Schema for allowed query properties
export const projectHistoryQueryProperties = Type.Pick(projectHistorySchema, ['id', 'projectId'])

export const projectHistoryQuerySchema = Type.Intersect([querySyntax(projectHistoryQueryProperties, {})], {
  additionalProperties: false
})
export interface ProjectHistoryQuery extends Static<typeof projectHistoryQuerySchema> {}

export const projectHistoryValidator = /* @__PURE__ */ getValidator(projectHistorySchema, dataValidator)
export const projectHistoryDataValidator = /* @__PURE__ */ getValidator(projectHistoryDataSchema, dataValidator)
export const projectHistoryQueryValidator = /* @__PURE__ */ getValidator(projectHistoryQuerySchema, queryValidator)
