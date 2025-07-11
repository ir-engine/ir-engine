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

import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { staticResourceSearchQueryValidator } from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { iff, isProvider } from 'feathers-hooks-common'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import {
  staticResourceSearchQueryResolver,
  staticResourceSearchResultResolver
} from './static-resource-search.resolvers'

/**
 * Rate limiting hook to prevent abuse of search functionality
 */
const rateLimitSearch = async (context: HookContext) => {
  // Simple rate limiting - in production you might want to use Redis or similar
  const userId = context.params.user?.id
  const ip = context.params.ip
  const key = userId || ip || 'anonymous'

  // For now, just log the search request
  // In production, implement proper rate limiting
  logger.info(`Search request from ${key}: "${context.params.query?.semanticSearch}"`)

  return context
}

/**
 * Validate search parameters
 */
const validateSearchParams = async (context: HookContext) => {
  const query = context.params.query

  if (!query?.semanticSearch) {
    throw new BadRequest('Search query is required')
  }

  // Additional validation can be added here
  if (query.semanticSearch.length < 2) {
    throw new BadRequest('Search query must be at least 2 characters long')
  }

  return context
}

/**
 * Log search analytics
 */
const logSearchAnalytics = async (context: HookContext) => {
  try {
    const semanticSearch = context.params.query?.semanticSearch
    const searchField = context.params.query?.searchField
    const resultCount = context.result?.data?.length || 0
    const userId = context.params.user?.id

    // Log search for analytics (in production, send to analytics service)
    logger.info('Search Analytics: %o', {
      semanticSearch,
      searchField,
      resultCount,
      userId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Don't fail the request if analytics logging fails
    logger.error('Failed to log search analytics:', error)
  }

  return context
}

export default {
  around: {
    all: [],
    find: [schemaHooks.resolveResult(staticResourceSearchResultResolver)]
  },

  before: {
    all: [],
    find: [
      // Validate user has permission to search
      iff(isProvider('external'), verifyScope('user', 'read')),

      // Rate limiting
      iff(isProvider('external'), rateLimitSearch),

      // Validate and resolve query parameters
      schemaHooks.validateQuery(staticResourceSearchQueryValidator),
      schemaHooks.resolveQuery(staticResourceSearchQueryResolver),

      // Additional validation
      validateSearchParams
    ]
  },

  after: {
    all: [],
    find: [
      // Log search analytics
      logSearchAnalytics
    ]
  },

  error: {
    all: [],
    find: []
  }
} as any
