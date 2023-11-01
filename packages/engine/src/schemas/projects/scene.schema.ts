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
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { TypedRecord, TypedString } from '../../common/types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const scenePath = 'scene'

export const sceneMethods = ['get', 'update', 'create', 'find', 'patch', 'remove'] as const

export type SceneID = OpaqueType<'SceneID'> & string

// Main data model schema
export const sceneSchema = Type.Object(
  {
    id: TypedString<SceneID>({
      format: 'uuid'
    }),
    name: Type.String(),
    scenePath: Type.String(),
    envMapPath: Type.String(),
    thumbnailPath: Type.String(),
    projectId: Type.Optional(
      Type.String({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Scene', additionalProperties: false }
)
export type SceneType = Static<typeof sceneSchema>

export const componentJsonSchema = Type.Object(
  {
    name: Type.String(),
    props: Type.Optional(Type.Any())
  },
  { $id: 'ComponentJson', additionalProperties: false }
)
export interface ComponentJsonType extends Static<typeof componentJsonSchema> {}

export const entityJsonSchema = Type.Object(
  {
    name: Type.Union([
      Type.String(),
      TypedString<EntityUUID>({
        format: 'uuid'
      })
    ]),
    type: Type.Optional(Type.String()),
    components: Type.Array(Type.Ref(componentJsonSchema)),
    parent: Type.Optional(
      TypedString<EntityUUID>({
        format: 'uuid'
      })
    ),
    index: Type.Optional(Type.Number())
  },
  { $id: 'EntityJson', additionalProperties: false }
)
export interface EntityJsonType extends Static<typeof entityJsonSchema> {}

export const sceneJsonSchema = Type.Object(
  {
    entities: TypedRecord(TypedString<EntityUUID>({ format: 'uuid' }), Type.Ref(entityJsonSchema)),
    root: TypedString<EntityUUID>({
      format: 'uuid'
    }),
    version: Type.Number()
  },
  { $id: 'SceneJson', additionalProperties: false }
)
export interface SceneJsonType extends Static<typeof sceneJsonSchema> {}

export const sceneMetadataSchema = Type.Object(
  {
    id: TypedString<SceneID>({
      format: 'uuid'
    }),
    name: Type.String(),
    thumbnailUrl: Type.String()
  },
  { $id: 'SceneMetadata', additionalProperties: false }
)
export interface SceneMetadataType extends Static<typeof sceneMetadataSchema> {}

export const sceneDataSchema = Type.Object(
  {
    ...sceneMetadataSchema.properties,
    project: Type.Optional(Type.String()),
    scene: Type.Ref(sceneJsonSchema)
  },
  { $id: 'SceneData', additionalProperties: false }
)
export interface SceneDataType extends Static<typeof sceneDataSchema> {}

// Schema for creating new entries
export const userDataSchema = Type.Partial(sceneSchema, {
  $id: 'UserData'
})
export type UserData = Static<typeof userDataSchema>

// Schema for creating new entries
export const sceneCreateDataSchema = Type.Object(
  {
    id: Type.Optional(
      TypedString<SceneID>({
        format: 'uuid'
      })
    ),
    name: Type.Optional(Type.String()),
    scenePath: Type.Optional(Type.String()),
    envMapPath: Type.Optional(Type.String()),
    projectId: Type.Optional(Type.String()),
    thumbnailPath: Type.Optional(Type.String()),
    storageProvider: Type.Optional(Type.String()),
    sceneData: Type.Optional(Type.Ref(sceneJsonSchema)),
    thumbnailBuffer: Type.Optional(Type.Any())
  },
  { $id: 'SceneCreateData', additionalProperties: false }
)
export interface SceneCreateData extends Static<typeof sceneCreateDataSchema> {}

// Schema for new created entries
export const sceneMetadataCreateSchema = Type.Object(
  {
    name: Type.String(),
    project: Type.String()
  },
  {
    $id: 'SceneMetadataCreate'
  }
)
export interface SceneMetadataCreate extends Static<typeof sceneMetadataCreateSchema> {}

// Schema for updating existing entries
export const scenePatchSchema = Type.Partial(sceneSchema, {
  $id: 'ScenePatch'
})
export type ScenePatch = Static<typeof scenePatchSchema>

// Schema for allowed query properties
export const sceneQueryProperties = Type.Pick(sceneSchema, [
  'name',
  'scenePath',
  'projectId',
  'thumbnailPath',
  'envMapPath'
])
export const sceneQuerySchema = Type.Intersect(
  [
    querySyntax(sceneQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        storageProvider: Type.Optional(Type.String()),
        metadataOnly: Type.Optional(Type.Boolean()),
        newSceneName: Type.Optional(Type.String()),
        oldSceneName: Type.Optional(Type.String()),
        internal: Type.Optional(Type.Boolean()),
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface SceneQuery extends Static<typeof sceneQuerySchema> {}

export const componentJsonValidator = getValidator(componentJsonSchema, dataValidator)
export const entityJsonValidator = getValidator(entityJsonSchema, dataValidator)
export const sceneJsonValidator = getValidator(sceneJsonSchema, dataValidator)
export const sceneMetadataValidator = getValidator(sceneMetadataSchema, dataValidator)
export const sceneDataValidator = getValidator(sceneDataSchema, dataValidator)
export const sceneValidator = getValidator(sceneSchema, dataValidator)
export const sceneCreateDataValidator = getValidator(sceneCreateDataSchema, dataValidator)
export const scenePatchValidator = getValidator(scenePatchSchema, dataValidator)
export const sceneQueryValidator = getValidator(sceneQuerySchema, queryValidator)
