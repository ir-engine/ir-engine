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
import type { Static } from '@feathersjs/typebox'
import { StringEnum, Type, getValidator } from '@feathersjs/typebox'
import { dataValidator } from '../validators'
import { projectUpdateTypes } from './project.schema'

export const projectBuildPath = 'project-build'

export const projectBuildMethods = ['find', 'patch'] as const

export const ProjectBuildUpdateItemSchema = Type.Object(
  {
    sourceURL: Type.String(),
    destinationURL: Type.String(),
    name: Type.String(),
    needsRebuild: Type.Optional(Type.Boolean()),
    reset: Type.Optional(Type.Boolean()),
    commitSHA: Type.String(),
    sourceBranch: Type.String(),
    updateType: StringEnum(projectUpdateTypes),
    updateSchedule: Type.String()
  },
  { $id: 'ProjectUpdate', additionalProperties: false }
)
export interface ProjectBuildUpdateItemType extends Static<typeof ProjectBuildUpdateItemSchema> {}

// Main data model schema
export const projectBuildSchema = Type.Object(
  {
    failed: Type.Boolean(),
    succeeded: Type.Boolean()
  },
  { $id: 'ProjectBuild', additionalProperties: false }
)
export interface ProjectBuildType extends Static<typeof projectBuildSchema> {}

// Schema for updating existing entries
export const projectBuildPatchSchema = Type.Object(
  {
    updateProjects: Type.Optional(Type.Boolean()),
    projectsToUpdate: Type.Optional(Type.Array(Type.Ref(ProjectBuildUpdateItemSchema)))
  },
  {
    $id: 'ProjectBuildPatch'
  }
)

export interface ProjectBuildPatch extends Static<typeof projectBuildPatchSchema> {}

export const projectUpdateValidator = getValidator(ProjectBuildUpdateItemSchema, dataValidator)
export const projectBuildValidator = getValidator(projectBuildSchema, dataValidator)
export const projectBuildPatchValidator = getValidator(projectBuildPatchSchema, dataValidator)
