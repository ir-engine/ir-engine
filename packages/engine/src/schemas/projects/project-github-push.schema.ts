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
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../validators'

export const projectGithubPushPath = 'project-github-push'

export const projectGithubPushMethods = ['patch'] as const

// Main data model schema
export const projectGithubPushSchema = Type.Object(
  {
    data: Type.Any()
  },
  { $id: 'ProjectGithubPush', additionalProperties: false }
)
export type ProjectGithubPushType = Static<typeof projectGithubPushSchema>

// Schema for allowed query properties
export const projectGithubPushQueryProperties = Type.Pick(projectGithubPushSchema, ['data'])

// Schema for updating existing entries
export const projectGithubPushPatchSchema = Type.Partial(projectGithubPushSchema, {
  $id: 'ProjectGithubPushPatch'
})

export type ProjectGithubPushPatch = Static<typeof projectGithubPushPatchSchema>

export const projectGithubPushQuerySchema = Type.Intersect(
  [
    querySyntax(projectGithubPushQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ProjectGithubPushQuery = Static<typeof projectGithubPushQuerySchema>

export const projectGithubPushValidator = getValidator(projectGithubPushSchema, dataValidator)
export const projectGithubPushQueryValidator = getValidator(projectGithubPushQuerySchema, queryValidator)
