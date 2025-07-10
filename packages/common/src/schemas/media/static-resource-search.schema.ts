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
import { getValidator, Type } from '@feathersjs/typebox'
import { queryValidator } from '../validators'

export const staticResourceSearchPath = 'static-resource-search'

export const staticResourceSearchMethods = ['find'] as const

// Search result schema - combines static resource data with search metadata
export const staticResourceSearchResultSchema = Type.Object(
  {
    // Static resource fields
    id: Type.String({ format: 'uuid' }),
    key: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    type: Type.String(),
    mimeType: Type.Optional(Type.String()),
    project: Type.Optional(Type.String()),
    hash: Type.String(),
    url: Type.String(),
    thumbnailKey: Type.Optional(Type.String()),
    thumbnailURL: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),

    // Vector search metadata
    searchScore: Type.Number({ minimum: 0, maximum: 1 }),
    matchedField: Type.String(),
    matchedContent: Type.Optional(Type.String())
  },
  { $id: 'StaticResourceSearchResult', additionalProperties: true }
)

export interface StaticResourceSearchResultType extends Static<typeof staticResourceSearchResultSchema> {}

export type StaticResourceSearchFieldType =
  | 'caption'
  | 'tags'
  | 'material'
  | 'style'
  | 'object_type'
  | 'location'
  | 'color'
  | 'combined'

// Search query schema
export const staticResourceSearchQuerySchema = Type.Object(
  {
    // Required search query
    semanticSearch: Type.String({ minLength: 1, maxLength: 500 }),

    // Optional search field specification
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

    // Optional similarity threshold (0-1)
    similarityThreshold: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),

    // Optional maximum number of results
    $limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),

    // Optional project filter
    project: Type.Optional(Type.String()),

    // Optional type filter
    type: Type.Optional(Type.String()),

    // Optional mime type filter
    mimeType: Type.Optional(Type.String()),

    // Skip pagination offset
    $skip: Type.Optional(Type.Integer({ minimum: 0 }))
  },
  { $id: 'StaticResourceSearchQuery', additionalProperties: true }
)

export interface StaticResourceSearchQueryType extends Static<typeof staticResourceSearchQuerySchema> {}

// Search response schema with pagination
export const staticResourceSearchResponseSchema = Type.Object(
  {
    total: Type.Integer({ minimum: 0 }),
    limit: Type.Integer({ minimum: 0 }),
    skip: Type.Integer({ minimum: 0 }),
    data: Type.Array(staticResourceSearchResultSchema)
  },
  { $id: 'StaticResourceSearchResponse', additionalProperties: true }
)

export interface StaticResourceSearchResponseType extends Static<typeof staticResourceSearchResponseSchema> {}

// Validators
export const staticResourceSearchQueryValidator = /* @__PURE__ */ getValidator(
  staticResourceSearchQuerySchema,
  queryValidator
)

// Export search field options for client use
export const SEARCH_FIELDS = [
  'caption',
  'tags',
  'material',
  'style',
  'object_type',
  'location',
  'color',
  'combined'
] as const

export type SearchField = (typeof SEARCH_FIELDS)[number]

// Default search parameters
export const DEFAULT_SEARCH_PARAMS = {
  searchField: 'combined' as SearchField,
  similarityThreshold: 0.7,
  limit: 20
} as const
