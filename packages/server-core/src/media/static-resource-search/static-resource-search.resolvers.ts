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

import type { HookContext } from '@feathersjs/feathers'
import { resolve, virtual } from '@feathersjs/schema'
import {
  DEFAULT_SEARCH_PARAMS,
  StaticResourceSearchQueryType,
  StaticResourceSearchResultType
} from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { fromDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { Application } from '../../../declarations'

export const staticResourceSearchResultResolver = resolve<StaticResourceSearchResultType, HookContext<Application>>({
  // Format timestamps
  createdAt: virtual(async (result) => fromDateTimeSql(result.createdAt)),
  updatedAt: virtual(async (result) => fromDateTimeSql(result.updatedAt)),

  // Ensure search score is properly formatted
  searchScore: virtual(async (result) => {
    if (typeof result.searchScore === 'number') {
      return Math.round(result.searchScore * 1000) / 1000 // Round to 3 decimal places
    }
    return 0
  })
})

export const staticResourceSearchQueryResolver = resolve<StaticResourceSearchQueryType, HookContext<Application>>({
  // Set default values for optional parameters
  searchField: async (value) => value || DEFAULT_SEARCH_PARAMS.searchField,
  similarityThreshold: async (value) => value || DEFAULT_SEARCH_PARAMS.similarityThreshold,
  $limit: async (value) => {
    if (value === undefined) return DEFAULT_SEARCH_PARAMS.limit
    return Math.min(Math.max(value, 1), 100) // Clamp between 1 and 100
  },
  $skip: async (value) => Math.max(value || 0, 0), // Ensure non-negative

  // Sanitize search query
  semanticSearch: async (value) => {
    if (typeof value !== 'string') {
      throw new Error('Search query must be a string')
    }

    // Trim whitespace and limit length
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      throw new Error('Search query cannot be empty')
    }
    if (trimmed.length > 500) {
      throw new Error('Search query too long (max 500 characters)')
    }

    return trimmed
  }
})
