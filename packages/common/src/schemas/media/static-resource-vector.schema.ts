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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025 
Infinite Reality Engine. All Rights Reserved.
*/

import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../validators'

export const staticResourceVectorPath = 'static-resource-vector'

export const staticResourceVectorMethods = ['get', 'find', 'create', 'update', 'patch', 'remove'] as const

// Main data model schema for vector database
export const staticResourceVectorSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    staticResourceId: Type.String({
      format: 'uuid'
    }),
    // Searchable text fields
    caption: Type.Optional(Type.String()),
    tags: Type.Optional(Type.String()),
    material: Type.Optional(Type.String()),
    style: Type.Optional(Type.String()),
    object_type: Type.Optional(Type.String()),
    location: Type.Optional(Type.String()),
    color: Type.Optional(Type.String()),
    // Vector embeddings for semantic search (stored as arrays in schema, strings in DB)
    captionEmbedding: Type.Optional(Type.Array(Type.Number())),
    tagsEmbedding: Type.Optional(Type.Array(Type.Number())),
    materialEmbedding: Type.Optional(Type.Array(Type.Number())),
    styleEmbedding: Type.Optional(Type.Array(Type.Number())),
    object_typeEmbedding: Type.Optional(Type.Array(Type.Number())),
    locationEmbedding: Type.Optional(Type.Array(Type.Number())),
    colorEmbedding: Type.Optional(Type.Array(Type.Number())),
    // Combined embedding for general search
    combinedEmbedding: Type.Optional(Type.Array(Type.Number())),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'StaticResourceVector', additionalProperties: false }
)

export interface StaticResourceVectorType extends Static<typeof staticResourceVectorSchema> {}

// Database type with vector embeddings as strings (for PGVector storage)
export interface StaticResourceVectorDatabaseType
  extends Omit<
    StaticResourceVectorType,
    | 'captionEmbedding'
    | 'tagsEmbedding'
    | 'materialEmbedding'
    | 'styleEmbedding'
    | 'object_typeEmbedding'
    | 'locationEmbedding'
    | 'colorEmbedding'
    | 'combinedEmbedding'
  > {
  captionEmbedding: string | null
  tagsEmbedding: string | null
  materialEmbedding: string | null
  styleEmbedding: string | null
  object_typeEmbedding: string | null
  locationEmbedding: string | null
  colorEmbedding: string | null
  combinedEmbedding: string | null
}

// Schema for creating new entries
export const staticResourceVectorDataSchema = Type.Partial(
  Type.Pick(staticResourceVectorSchema, [
    'id',
    'staticResourceId',
    'caption',
    'tags',
    'material',
    'style',
    'object_type',
    'location',
    'color',
    'captionEmbedding',
    'tagsEmbedding',
    'materialEmbedding',
    'styleEmbedding',
    'object_typeEmbedding',
    'locationEmbedding',
    'colorEmbedding',
    'combinedEmbedding'
  ]),
  { $id: 'StaticResourceVectorData' }
)
export interface StaticResourceVectorData extends Static<typeof staticResourceVectorDataSchema> {}

// Schema for updating existing entries
export const staticResourceVectorPatchSchema = Type.Partial(
  Type.Pick(staticResourceVectorSchema, [
    'staticResourceId',
    'caption',
    'tags',
    'material',
    'style',
    'object_type',
    'location',
    'color',
    'captionEmbedding',
    'tagsEmbedding',
    'materialEmbedding',
    'styleEmbedding',
    'object_typeEmbedding',
    'locationEmbedding',
    'colorEmbedding',
    'combinedEmbedding'
  ]),
  { $id: 'StaticResourceVectorPatch' }
)
export interface StaticResourceVectorPatch extends Static<typeof staticResourceVectorPatchSchema> {}

// Schema for allowed query properties
export const staticResourceVectorQueryProperties = Type.Pick(staticResourceVectorSchema, [
  'id',
  'staticResourceId',
  'caption',
  'tags',
  'material',
  'style',
  'object_type',
  'location',
  'color',
  'createdAt',
  'updatedAt'
])

export const staticResourceVectorQuerySchema = Type.Intersect(
  [
    querySyntax(staticResourceVectorQueryProperties),
    // Add additional query capabilities for semantic search
    Type.Object(
      {
        // Semantic search query
        semanticSearch: Type.Optional(Type.String()),
        // Field to search in (default: combined)
        searchField: Type.Optional(
          Type.Union([
            Type.Literal('caption'),
            Type.Literal('tags'),
            Type.Literal('material'),
            Type.Literal('style'),
            Type.Literal('object_type'),
            Type.Literal('location'),
            Type.Literal('color'),
            Type.Literal('combined')
          ])
        ),
        // Similarity threshold for vector search (0-1)
        similarityThreshold: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
        // Maximum number of results for similarity search
        maxResults: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 }))
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface StaticResourceVectorQuery extends Static<typeof staticResourceVectorQuerySchema> {}

export const staticResourceVectorValidator = /* @__PURE__ */ getValidator(staticResourceVectorSchema, dataValidator)
export const staticResourceVectorDataValidator = /* @__PURE__ */ getValidator(
  staticResourceVectorDataSchema,
  dataValidator
)
export const staticResourceVectorPatchValidator = /* @__PURE__ */ getValidator(
  staticResourceVectorPatchSchema,
  dataValidator
)
export const staticResourceVectorQueryValidator = /* @__PURE__ */ getValidator(
  staticResourceVectorQuerySchema,
  queryValidator
)
