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
import { dataValidator } from '../validators'
import { sceneJsonSchema, sceneMetadataSchema } from './scene.schema'

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html

export const sceneDataPath = 'scene-data'

export const sceneDataMethods = ['get', 'find', 'create', 'update', 'patch'] as const

export const sceneDataSchema = Type.Object(
  {
    ...sceneMetadataSchema.properties,
    scene: Type.Ref(sceneJsonSchema)
  },
  { $id: 'SceneData', additionalProperties: false }
)
export interface SceneDataType extends Static<typeof sceneDataSchema> {}

// Schema for creating new entries
export const sceneCreateDataSchema = Type.Object(
  {
    projectName: Type.Optional(Type.String()),
    storageProvider: Type.Optional(Type.String())
  },
  { $id: 'SceneCreateData', additionalProperties: false }
)
export interface SceneCreateData extends Static<typeof sceneCreateDataSchema> {}

// Schema for creating new entries
export const sceneUpdateDataSchema = Type.Object(
  {
    name: Type.String(),
    projectName: Type.Optional(Type.String()),
    storageProvider: Type.Optional(Type.String()),
    sceneData: Type.Ref(sceneJsonSchema),
    thumbnailBuffer: Type.Optional(Type.Any())
  },
  { $id: 'SceneUpdateData', additionalProperties: false }
)
export interface SceneUpdateData extends Static<typeof sceneUpdateDataSchema> {}

// Schema for updating existing entries
export const sceneDataPatchSchema = Type.Object(
  {
    newSceneName: Type.Optional(Type.String()),
    oldSceneName: Type.Optional(Type.String()),
    storageProvider: Type.Optional(Type.String()),
    projectName: Type.Optional(Type.String())
  },
  {
    $id: 'SceneDataPatch'
  }
)
export type SceneDataPatch = Static<typeof sceneDataPatchSchema>

// Schema for allowed query properties
export const sceneDataQueryProperties = Type.Partial(sceneDataSchema)
export const sceneDataQuerySchema = Type.Intersect(
  [
    querySyntax(sceneDataQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        internal: Type.Optional(Type.Boolean()),
        projectName: Type.Optional(Type.String()),
        metadataOnly: Type.Optional(Type.Boolean()),
        storageProvider: Type.Optional(Type.String()),
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface SceneDataQuery extends Static<typeof sceneDataQuerySchema> {}

export const sceneDataValidator = getValidator(sceneDataSchema, dataValidator)
export const sceneCreateDataValidator = getValidator(sceneCreateDataSchema, dataValidator)
export const sceneUpdateDataValidator = getValidator(sceneUpdateDataSchema, dataValidator)
export const sceneDataPatchValidator = getValidator(sceneDataPatchSchema, dataValidator)
