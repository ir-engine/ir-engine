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
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { projectSettingSchema } from '../setting/project-setting.schema'
import { UserID, UserType } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'
import { projectPermissionSchema } from './project-permission.schema'

export const projectPath = 'project'

export const projectMethods = ['get', 'find', 'create', 'patch', 'remove', 'update'] as const

export const projectUpdateTypes = ['none', 'commit', 'tag']

// Main data model schema
export const projectSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    enabled: Type.Boolean(),
    thumbnail: Type.Optional(Type.String()),
    repositoryPath: Type.String(),
    version: Type.Optional(Type.String()),
    engineVersion: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    needsRebuild: Type.Boolean(),
    hasLocalChanges: Type.Boolean(),
    sourceRepo: Type.Optional(Type.String()),
    sourceBranch: Type.Optional(Type.String()),
    updateType: Type.Optional(StringEnum(projectUpdateTypes)),
    updateSchedule: Type.Optional(Type.String()),
    updateUserId: Type.Optional(Type.String()),
    hasWriteAccess: Type.Optional(Type.Boolean()),
    projectPermissions: Type.Optional(Type.Array(Type.Ref(projectPermissionSchema))),
    commitSHA: Type.Optional(Type.String()),
    commitDate: Type.Optional(Type.String({ format: 'date-time' })),
    assetsOnly: Type.Boolean(),
    isPublishedVersion: Type.Boolean(),
    visibility: StringEnum(['private', 'public']),
    projectPublishId: Type.Optional(
      Type.String({
        format: 'uuid'
      })
    ),
    settings: Type.Optional(Type.Array(Type.Ref(projectSettingSchema))),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Project', additionalProperties: false }
)
export interface ProjectType extends Static<typeof projectSchema> {}

export interface ProjectDatabaseType extends Omit<ProjectType, 'settings'> {}

// Schema for creating new entries
export const projectDataSchema = Type.Partial(projectSchema, {
  $id: 'ProjectData'
})
export interface ProjectData extends Static<typeof projectDataSchema> {}

// Schema for updating existing entries
export const projectPatchSchema = Type.Partial(projectSchema, {
  $id: 'ProjectPatch'
})
export interface ProjectPatch extends Static<typeof projectPatchSchema> {}

// Schema for allowed query properties
export const projectQueryProperties = Type.Pick(projectSchema, [
  'id',
  'name',
  'enabled',
  'thumbnail',
  'repositoryPath',
  'version',
  'engineVersion',
  'description',
  'needsRebuild',
  'hasLocalChanges',
  'sourceRepo',
  'sourceBranch',
  'updateType',
  'updateSchedule',
  'updateUserId',
  'hasWriteAccess',
  'visibility',
  'projectPublishId',
  'isPublishedVersion',
  'commitSHA',
  'commitDate'
])
export const projectQuerySchema = Type.Intersect(
  [
    querySyntax(projectQueryProperties, {
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        assetsOnly: Type.Optional(Type.Boolean()),
        action: Type.Optional(Type.String()),
        sourceURL: Type.Optional(Type.String()),
        destinationURL: Type.Optional(Type.String()),
        existingProject: Type.Optional(Type.Boolean()),
        inputProjectURL: Type.Optional(Type.String()),
        selectedSHA: Type.Optional(Type.String()),
        allowed: Type.Optional(Type.Boolean()),
        reset: Type.Optional(Type.Boolean()),
        populateProjectPermissions: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  // Add additional query properties here
  { additionalProperties: false }
)
export interface ProjectQuery extends Static<typeof projectQuerySchema> {}

export const projectValidator = /* @__PURE__ */ getValidator(projectSchema, dataValidator)
export const projectDataValidator = /* @__PURE__ */ getValidator(projectDataSchema, dataValidator)
export const projectPatchValidator = /* @__PURE__ */ getValidator(projectPatchSchema, dataValidator)
export const projectQueryValidator = /* @__PURE__ */ getValidator(projectQuerySchema, queryValidator)

export type ProjectUpdateParams = {
  user?: UserType
  isJob?: boolean
  jobId?: string
  populateProjectPermissions?: boolean
}
