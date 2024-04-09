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
import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator } from '@feathersjs/typebox'
import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const scenePath = 'scene'

export const sceneMethods = ['get', 'update', 'create', 'find', 'patch', 'remove'] as const

export type SceneID = OpaqueType<'SceneID'> & string

export const sceneDataSchema = Type.Object(
  {
    id: TypedString<SceneID>(),
    scenePath: Type.String(),
    name: Type.String(),
    thumbnailUrl: Type.String(),
    projectId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'SceneData', additionalProperties: false }
)
export interface SceneDataType extends Static<typeof sceneDataSchema> {}

// Schema for creating new entries
export const sceneCreateDataSchema = Type.Object(
  {
    id: Type.Optional(TypedString<SceneID>()),
    storageProvider: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    scenePath: Type.Optional(Type.String()),
    thumbnailUrl: Type.Optional(Type.Any()),
    storageProviderName: Type.Optional(Type.String()),
    project: Type.Optional(Type.String()),
    projectId: Type.Optional(Type.String()),
    directory: Type.Optional(Type.String()),
    localDirectory: Type.Optional(Type.String())
  },
  { $id: 'SceneCreateData', additionalProperties: false }
)
export interface SceneCreateData extends Static<typeof sceneCreateDataSchema> {}

// Schema for updated entries
export const sceneUpdateSchema = Type.Object(
  {
    id: Type.String()
  },
  { $id: 'SceneUpdate', additionalProperties: false }
)
export interface SceneUpdate extends Static<typeof sceneUpdateSchema> {}

// Schema for updating existing entries
export const scenePatchSchema = Type.Object(
  {
    newSceneName: Type.Optional(Type.String()),
    oldSceneName: Type.Optional(Type.String()),
    storageProviderName: Type.Optional(Type.String()),
    project: Type.Optional(Type.String()),
    directory: Type.Optional(Type.String()),
    localDirectory: Type.Optional(Type.String())
  },
  {
    $id: 'ScenePatch'
  }
)

export interface ScenePatch extends Static<typeof scenePatchSchema> {}

// Schema for allowed query properties
export const sceneQuerySchema = Type.Intersect(
  [
    Type.Object(
      {
        project: Type.Optional(Type.String()),
        projectId: Type.Optional(Type.String()),
        name: Type.Optional(Type.String()),
        scenePath: Type.Optional(Type.String()),
        internal: Type.Optional(Type.Boolean()),
        paginate: Type.Optional(Type.Boolean()),
        directory: Type.Optional(Type.String()),
        localDirectory: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface SceneQuery extends Static<typeof sceneQuerySchema> {}

// export const componentJsonValidator = /* @__PURE__ */ getValidator(componentJsonSchema, dataValidator)
// export const entityJsonValidator = /* @__PURE__ */ getValidator(entityJsonSchema, dataValidator)
// export const sceneJsonValidator = /* @__PURE__ */ getValidator(sceneJsonSchema, dataValidator)
export const sceneDataValidator = /* @__PURE__ */ getValidator(sceneDataSchema, dataValidator)
export const sceneQueryValidator = /* @__PURE__ */ getValidator(sceneQuerySchema, queryValidator)
