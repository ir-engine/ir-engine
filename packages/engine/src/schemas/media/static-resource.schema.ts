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
import { querySyntax, Type } from '@feathersjs/typebox'

export const staticResourcePath = 'static-resource'

export const staticResourceMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const staticResourceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    sid: Type.String(),
    key: Type.String(),
    metadata: Type.Any(),
    mimeType: Type.String(),
    userId: Type.String({
      format: 'uuid'
    }),
    hash: Type.String(),
    project: Type.String(),
    driver: Type.String(),
    attribution: Type.String(),
    licensing: Type.String(),
    tags: Type.Array(Type.String()),
    url: Type.String(),
    stats: Type.Record(Type.String(), Type.Any()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'StaticResource', additionalProperties: false }
)
export type StaticResourceType = Static<typeof staticResourceSchema>

export type StaticResourceDatabaseType = Omit<StaticResourceType, 'metadata' | 'tags' | 'stats'> & {
  metadata: string
  tags: string
  stats: string
}

// Schema for creating new entries
export const staticResourceDataSchema = Type.Pick(
  staticResourceSchema,
  [
    'sid',
    'key',
    'metadata',
    'mimeType',
    'userId',
    'hash',
    'project',
    'driver',
    'attribution',
    'licensing',
    'tags',
    'url',
    'stats'
  ],
  {
    $id: 'StaticResourceData'
  }
)
export type StaticResourceData = Static<typeof staticResourceDataSchema>

// Schema for updating existing entries
export const staticResourcePatchSchema = Type.Partial(staticResourceSchema, {
  $id: 'StaticResourcePatch'
})
export type StaticResourcePatch = Static<typeof staticResourcePatchSchema>

// Schema for allowed query properties
export const staticResourceQueryProperties = Type.Pick(staticResourceSchema, [
  'id',
  'sid',
  'key',
  // 'metadata', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  'mimeType',
  'userId',
  'hash',
  'project',
  'driver',
  'attribution',
  'licensing',
  // 'tags',
  'url'
  // 'stats'
])
export const staticResourceQuerySchema = Type.Intersect(
  [
    querySyntax(staticResourceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type StaticResourceQuery = Static<typeof staticResourceQuerySchema>
