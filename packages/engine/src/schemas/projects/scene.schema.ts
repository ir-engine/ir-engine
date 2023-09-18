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
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator } from '@feathersjs/typebox'
import { TypedRecord, TypedString } from '../../common/types/TypeboxUtils'
import { dataValidator } from '../validators'

export const scenePath = 'scene'

export const sceneMethods = ['get', 'create', 'find', 'patch', 'remove'] as const

export const componentJsonSchema = Type.Object(
  {
    name: Type.String(),
    props: Type.Any()
  },
  { $id: 'ComponentJson', additionalProperties: false }
)
export type ComponentJsonType = Static<typeof componentJsonSchema>

export const entityJsonSchema = Type.Object(
  {
    name: TypedString<EntityUUID>({
      format: 'uuid'
    }),
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
export type EntityJsonType = Static<typeof entityJsonSchema>

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
export type SceneJsonType = Static<typeof sceneJsonSchema>

export const sceneMetadataSchema = Type.Object(
  {
    name: Type.String(),
    thumbnailUrl: Type.String(),
    project: Type.String()
  },
  { $id: 'SceneMetadata', additionalProperties: false }
)
export type SceneMetadataType = Static<typeof sceneMetadataSchema>

export const sceneDataSchema = Type.Object(
  {
    ...sceneMetadataSchema.properties,
    scene: Type.Ref(sceneJsonSchema)
  },
  { $id: 'SceneData', additionalProperties: false }
)
export type SceneDataType = Static<typeof sceneDataSchema>

export const componentJsonValidator = getValidator(componentJsonSchema, dataValidator)
export const entityJsonValidator = getValidator(entityJsonSchema, dataValidator)
export const sceneJsonValidator = getValidator(sceneJsonSchema, dataValidator)
export const sceneMetadataValidator = getValidator(sceneMetadataSchema, dataValidator)
export const sceneDataValidator = getValidator(sceneDataSchema, dataValidator)
