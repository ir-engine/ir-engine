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

import type { Static } from '@feathersjs/typebox'
import { getValidator, Type } from '@feathersjs/typebox'

import { dataValidator } from '../validators'
import { staticResourceSchema } from './static-resource.schema'

export const fileBrowserPath = 'file-browser'
export const fileBrowserMethods = ['create', 'find', 'get', 'patch', 'remove', 'update'] as const

export const fileBrowserContentSchema = Type.Object(
  {
    key: Type.String(),
    type: Type.String(),
    name: Type.String(),
    url: Type.String(),
    thumbnailURL: Type.Optional(Type.String()),
    size: Type.Optional(Type.Number())
  },
  {
    $id: 'FileBrowserContent'
  }
)
export interface FileBrowserContentType extends Static<typeof fileBrowserContentSchema> {}

export const fileBrowserUpdateSchema = Type.Object(
  {
    oldProject: Type.String(),
    newProject: Type.String(),
    oldName: Type.String(),
    newName: Type.String(),
    oldPath: Type.String(),
    newPath: Type.String(),
    isCopy: Type.Optional(Type.Boolean()),
    storageProviderName: Type.Optional(Type.String())
  },
  {
    $id: 'FileBrowserUpdate'
  }
)
export interface FileBrowserUpdate extends Static<typeof fileBrowserUpdateSchema> {}

export const fileBrowserPatchSchema = Type.Intersect(
  [
    Type.Partial(
      Type.Pick(staticResourceSchema, [
        'type',
        'tags',
        'dependencies',
        'attribution',
        'licensing',
        'description',
        'thumbnailKey',
        'thumbnailMode'
      ])
    ),
    Type.Object({
      path: Type.String(),
      unique: Type.Optional(Type.Boolean()),
      project: Type.String(),
      body: Type.Any(), // Buffer | string
      contentType: Type.Optional(Type.String()),
      storageProviderName: Type.Optional(Type.String()),
      fileName: Type.Optional(Type.String())
    })
  ],
  {
    additionalProperties: false,
    $id: 'FileBrowserPatch'
  }
)
export interface FileBrowserPatch extends Static<typeof fileBrowserPatchSchema> {}

export const fileBrowserContentValidator = /* @__PURE__ */ getValidator(fileBrowserContentSchema, dataValidator)
export const fileBrowserUpdateValidator = /* @__PURE__ */ getValidator(fileBrowserUpdateSchema, dataValidator)
export const fileBrowserPatchValidator = /* @__PURE__ */ getValidator(fileBrowserPatchSchema, dataValidator)
