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
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../validators'

export const assetPath = 'asset'

export const assetMethods = ['get', 'update', 'create', 'find', 'patch', 'remove'] as const

export const assetSchema = Type.Object(
  {
    id: Type.String(),
    assetURL: Type.String(),
    thumbnailURL: Type.String(),
    projectName: Type.String(),
    projectId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Asset', additionalProperties: false }
)
export interface AssetType extends Static<typeof assetSchema> {}

export interface AssetDatabaseType extends Omit<AssetType, 'projectName'> {}

// Schema for creating new entries
export const assetDataSchema = Type.Object(
  {
    id: Type.Optional(Type.String()),
    assetURL: Type.Optional(Type.String()),
    isScene: Type.Optional(Type.Boolean()),
    sourceURL: Type.Optional(Type.String()),
    thumbnailURL: Type.Optional(Type.Any()),
    project: Type.Optional(Type.String()),
    projectId: Type.Optional(Type.String())
  },
  { $id: 'AssetData', additionalProperties: false }
)
export interface AssetData extends Static<typeof assetDataSchema> {}

// Schema for updated entries
export const assetUpdateSchema = Type.Object(
  {
    id: Type.String()
  },
  { $id: 'AssetUpdate', additionalProperties: false }
)
export interface AssetUpdate extends Static<typeof assetUpdateSchema> {}

// Schema for updating existing entries
export const assetPatchSchema = Type.Object(
  {
    project: Type.Optional(Type.String()),
    assetURL: Type.Optional(Type.String()),
    thumbnailURL: Type.Optional(Type.String())
  },
  {
    $id: 'AssetPatch'
  }
)

export interface AssetPatch extends Static<typeof assetPatchSchema> {}

// Schema for allowed query properties
export const assetQueryProperties = Type.Pick(assetDataSchema, ['assetURL', 'project', 'projectId'])

export const assetQuerySchema = Type.Intersect(
  [
    querySyntax(assetQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        paginate: Type.Optional(Type.Boolean()),
        internal: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface AssetQuery extends Static<typeof assetQuerySchema> {}

export const assetValidator = /* @__PURE__ */ getValidator(assetSchema, dataValidator)
export const assetDataValidator = /* @__PURE__ */ getValidator(assetDataSchema, dataValidator)
export const assetPatchValidator = /* @__PURE__ */ getValidator(assetPatchSchema, dataValidator)
export const assetQueryValidator = /* @__PURE__ */ getValidator(assetQuerySchema, queryValidator)
