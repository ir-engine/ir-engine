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
import { getValidator, querySyntax, Static, Type } from '@feathersjs/typebox'

import { UUID } from 'crypto'
import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const spawnPointPath = 'spawn-point'

export const spawnPointMethods = ['get', 'update', 'create', 'find', 'patch', 'remove'] as const

export const spawnPointSchema = Type.Object(
  {
    id: TypedString<UUID>({
      format: 'uuid'
    }),
    sceneId: Type.String(),
    name: Type.String(),
    previewImageURL: Type.String(),
    position: Type.Object({
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number()
    }),
    rotation: Type.Object({
      x: Type.Number(),
      y: Type.Number(),
      z: Type.Number(),
      w: Type.Number()
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'SpawnPoint', additionalProperties: false }
)
export interface SpawnPointType extends Static<typeof spawnPointSchema> {}

// Schema for creating new entries
export const spawnPointDataSchema = Type.Pick(
  spawnPointSchema,
  ['sceneId', 'previewImageURL', 'position', 'rotation'],
  {
    $id: 'SpawnPointData'
  }
)
export interface SpawnPointData extends Static<typeof spawnPointDataSchema> {}

// Schema for updating existing entries
export const spawnPointPatchSchema = Type.Partial(spawnPointSchema, {
  $id: 'SpawnPointPatch'
})
export interface SpawnPointPatch extends Static<typeof spawnPointPatchSchema> {}

// Schema for allowed query properties
export const spawnPointQueryProperties = Type.Pick(spawnPointSchema, [
  'id',
  'sceneId',
  'previewImageURL',
  'position',
  'rotation'
])
export const spawnPointQuerySchema = Type.Intersect(
  [
    querySyntax(spawnPointQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface SpawnPointQuery extends Static<typeof spawnPointQuerySchema> {}

export const spawnPointValidator = /* @__PURE__ */ getValidator(spawnPointSchema, dataValidator)
export const spawnPointDataValidator = /* @__PURE__ */ getValidator(spawnPointDataSchema, dataValidator)
export const spawnPointPatchValidator = /* @__PURE__ */ getValidator(spawnPointPatchSchema, dataValidator)
export const spawnPointQueryValidator = /* @__PURE__ */ getValidator(spawnPointQuerySchema, queryValidator)
