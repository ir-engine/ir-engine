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
import { TypedRecord, TypedString } from '../../types/TypeboxUtils'
import { dataValidator } from '../validators'

export const scenePath = 'scene'

export const sceneMethods = ['get', 'update', 'create', 'find', 'patch', 'remove'] as const

export type SceneID = OpaqueType<'SceneID'> & string

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
    name: Type.String(),
    thumbnailUrl: Type.String(),
    project: Type.String()
  },
  { $id: 'SceneMetadata', additionalProperties: false }
)
export interface SceneMetadataType extends Static<typeof sceneMetadataSchema> {}

export const sceneDataSchema = Type.Object(
  {
    ...sceneMetadataSchema.properties,
    scene: Type.Ref(sceneJsonSchema),
    scenePath: TypedString<SceneID>()
  },
  { $id: 'SceneData', additionalProperties: false }
)
export interface SceneDataType extends Static<typeof sceneDataSchema> {}

// Schema for creating new entries
export const sceneCreateDataSchema = Type.Object(
  {
    storageProvider: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    sceneData: Type.Optional(Type.Ref(sceneJsonSchema)),
    thumbnailBuffer: Type.Optional(Type.Any()),
    storageProviderName: Type.Optional(Type.String()),
    project: Type.Optional(Type.String()),
    directory: Type.Optional(Type.String()),
    localDirectory: Type.Optional(Type.String())
  },
  { $id: 'SceneCreateData', additionalProperties: false }
)
export interface SceneCreateData extends Static<typeof sceneCreateDataSchema> {}

// Schema for new created entries
export const sceneMetadataCreateSchema = Type.Object(
  {
    name: Type.String(),
    project: Type.String(),
    scenePath: TypedString<SceneID>()
  },
  {
    $id: 'SceneMetadataCreate'
  }
)
export interface SceneMetadataCreate extends Static<typeof sceneMetadataCreateSchema> {}

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
export const sceneQueryProperties = Type.Pick(sceneDataSchema, ['name', 'project'])
export const sceneQuerySchema = Type.Intersect(
  [
    querySyntax(sceneQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        storageProviderName: Type.Optional(Type.String()),
        metadataOnly: Type.Optional(Type.Boolean()),
        internal: Type.Optional(Type.Boolean()),
        paginate: Type.Optional(Type.Boolean()),
        sceneKey: Type.Optional(TypedString<SceneID>()),
        directory: Type.Optional(Type.String()),
        localDirectory: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface SceneQuery extends Static<typeof sceneQuerySchema> {}

export const componentJsonValidator = /* @__PURE__ */ getValidator(componentJsonSchema, dataValidator)
export const entityJsonValidator = /* @__PURE__ */ getValidator(entityJsonSchema, dataValidator)
export const sceneJsonValidator = /* @__PURE__ */ getValidator(sceneJsonSchema, dataValidator)
export const sceneMetadataValidator = /* @__PURE__ */ getValidator(sceneMetadataSchema, dataValidator)
export const sceneDataValidator = /* @__PURE__ */ getValidator(sceneDataSchema, dataValidator)
