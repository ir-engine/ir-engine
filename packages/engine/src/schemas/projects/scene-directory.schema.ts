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
import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'

export const sceneDirectoryPath = 'scene-directory'

export const sceneDirectoryMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const sceneDirectorySchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    reference: Type.String(),
    sceneDirectoryId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'SceneDirectory', additionalProperties: false }
)
export type SceneDirectoryType = Static<typeof sceneDirectorySchema>

// Schema for creating new entries
export const sceneDirectoryDataSchema = Type.Partial(sceneDirectorySchema, {
  $id: 'SceneDirectoryData'
})
export type SceneDirectoryData = Static<typeof sceneDirectoryDataSchema>

// Schema for updating existing entries
export const sceneDirectoryPatchSchema = Type.Partial(sceneDirectorySchema, {
  $id: 'SceneDirectoryPatch'
})
export type SceneDirectoryPatch = Static<typeof sceneDirectoryPatchSchema>

// Schema for allowed query properties
export const sceneDirectoryQueryProperties = Type.Pick(sceneDirectorySchema, ['name', 'sceneDirectoryId', 'reference'])
export const sceneDirectoryQuerySchema = Type.Intersect(
  [
    querySyntax(sceneDirectoryQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type SceneDirectoryQuery = Static<typeof sceneDirectoryQuerySchema>

export const sceneDirectoryValidator = getValidator(sceneDirectorySchema, dataValidator)
export const sceneDirectoryDataValidator = getValidator(sceneDirectoryDataSchema, dataValidator)
export const sceneDirectoryPatchValidator = getValidator(sceneDirectoryPatchSchema, dataValidator)
export const sceneDirectoryQueryValidator = getValidator(sceneDirectoryQuerySchema, queryValidator)
