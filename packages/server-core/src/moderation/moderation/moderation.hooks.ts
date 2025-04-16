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
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  moderationDataValidator,
  moderationPatchValidator,
  moderationQueryValidator
} from '@ir-engine/common/src/schemas/moderation/moderation.schema'
import {
  moderationDataResolver,
  moderationExternalResolver,
  moderationPatchResolver,
  moderationQueryResolver,
  moderationResolver
} from './moderation.resolvers'

import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { moderationPath } from '@ir-engine/common/src/schema.type.module'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { discardQuery, iff, isProvider } from 'feathers-hooks-common'
import persistQuery from '../../hooks/persist-query'

const validateModeration = async (context: HookContext) => {
  const { data } = context

  if (data.type === 'user') {
    if (!data.reportedUserId) {
      throw new BadRequest('reportedUserId must be provided when type is Person')
    }
  }

  return context
}

/**
 * Handles the moderation search functionality by modifying the query parameters
 * and constructing a custom Knex query for filtering moderation records based on
 * a search string. The search string can match either the `referenceNumber` of
 * the moderation record or the `name` of the reported user.
 *
 * @param context - The hook context object containing the query parameters and service.
 *
 * @remarks
 * - If a `search` parameter is present in the query, it is removed from the query
 *   parameters to prevent it from being used in the default WHERE clause.
 * - A custom Knex query is built to perform a search on the `referenceNumber` field
 *   of the moderation record or the `name` field of the reported user.
 * - The constructed query is assigned to `context.params.knex` for further processing.
 *
 * @returns The modified hook context with the custom Knex query applied.
 */
const handleModerationSearch = async (context: HookContext) => {
  if (!context.params.query?.search) return context

  const searchString = context.params.query.search
  discardQuery('search')(context)

  const query = context.service
    .createQuery(context.params)
    .clearSelect()
    .select(`${moderationPath}.*`)
    .leftJoin(userPath, `${userPath}.id`, `${moderationPath}.reportedUserId`)
    .where((builder) => {
      builder
        .where(`${moderationPath}.referenceNumber`, 'like', `%${searchString}%`)
        .orWhere(`${userPath}.name`, 'like', `%${searchString}%`)
    })

  context.params.knex = query
  return context
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(moderationExternalResolver), schemaHooks.resolveResult(moderationResolver)]
  },
  before: {
    all: [schemaHooks.validateQuery(moderationQueryValidator), schemaHooks.resolveQuery(moderationQueryResolver)],
    find: [iff(isProvider('external'), verifyScope('moderation', 'read')), persistQuery, handleModerationSearch],
    get: [
      iff(isProvider('external'), verifyScope('moderation', 'read')),
      schemaHooks.validateQuery(moderationQueryValidator),
      schemaHooks.resolveQuery(moderationQueryResolver),
      persistQuery,
      handleModerationSearch
    ],
    create: [
      validateModeration,
      schemaHooks.validateData(moderationDataValidator),
      schemaHooks.resolveData(moderationDataResolver)
    ],
    patch: [
      iff(isProvider('external'), verifyScope('moderation', 'write')),
      schemaHooks.validateData(moderationPatchValidator),
      schemaHooks.resolveData(moderationPatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('moderation', 'write'))]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: []
  }
} as any
