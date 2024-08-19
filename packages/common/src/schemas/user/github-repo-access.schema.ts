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

import { dataValidator, queryValidator } from '../validators'

export const githubRepoAccessPath = 'github-repo-access'

export const githubRepoAccessMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const githubRepoAccessSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    repo: Type.String(),
    hasWriteAccess: Type.Boolean(),
    identityProviderId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'GithubRepoAccess', additionalProperties: false }
)
export interface GithubRepoAccessType extends Static<typeof githubRepoAccessSchema> {}

// Schema for creating new entries
export const githubRepoAccessDataSchema = Type.Pick(
  githubRepoAccessSchema,
  ['repo', 'hasWriteAccess', 'identityProviderId'],
  {
    $id: 'GithubRepoAccessData'
  }
)
export interface GithubRepoAccessData extends Static<typeof githubRepoAccessDataSchema> {}

// Schema for updating existing entries
export const githubRepoAccessPatchSchema = Type.Partial(githubRepoAccessSchema, {
  $id: 'GithubRepoAccessPatch'
})
export interface GithubRepoAccessPatch extends Static<typeof githubRepoAccessPatchSchema> {}

// Schema for allowed query properties
export const githubRepoAccessQueryProperties = Type.Pick(githubRepoAccessSchema, [
  'id',
  'repo',
  'hasWriteAccess',
  'identityProviderId'
])
export const githubRepoAccessQuerySchema = Type.Intersect(
  [
    querySyntax(githubRepoAccessQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface GithubRepoAccessQuery extends Static<typeof githubRepoAccessQuerySchema> {}

export const githubRepoAccessValidator = /* @__PURE__ */ getValidator(githubRepoAccessSchema, dataValidator)
export const githubRepoAccessDataValidator = /* @__PURE__ */ getValidator(githubRepoAccessDataSchema, dataValidator)
export const githubRepoAccessPatchValidator = /* @__PURE__ */ getValidator(githubRepoAccessPatchSchema, dataValidator)
export const githubRepoAccessQueryValidator = /* @__PURE__ */ getValidator(githubRepoAccessQuerySchema, queryValidator)
