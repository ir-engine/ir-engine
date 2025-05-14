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
import { moderationPath } from '@ir-engine/common/src/schema.type.module'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application, HookContext } from '@ir-engine/server-core/declarations'
import verifyScope from '@ir-engine/server-core/src/hooks/verify-scope'
import { discardQuery, iff, isProvider } from 'feathers-hooks-common'
import makeQueryJoinable from '../../hooks/make-query-joinable'
import persistQuery from '../../hooks/persist-query'
import { ModerationService } from './moderation.class'

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
 * A hook function to handle moderation search functionality in the application.
 * This function modifies the query parameters of the context to enable searching
 * for moderation records based on a search string. It supports searching by
 * reference number or the name of the reported user.
 *
 * @param context - The hook context for the ModerationService, containing the query
 *                  parameters and other relevant data.
 * @returns The modified hook context with an updated query for searching moderation records.
 *
 * ### Behavior:
 * - If a `search` parameter exists in the query:
 *   - Removes the `action` and `search` parameters from the query.
 *   - Makes the query joinable with the moderation table.
 *   - Joins the moderation table with the user table on the `reportedUserId` field.
 *   - Adds search conditions to filter records by `referenceNumber` or `name` of the reported user.
 * - Updates the `knex` query builder in the context with the modified query.
 */
const handleModerationSearch = async (context: HookContext<ModerationService>) => {
  if (context.params.query?.search) {
    const searchString = context.params.query.search

    discardQuery('action', 'search')(context)
    await makeQueryJoinable(moderationPath)(context as any as HookContext<Application>)
    const query = context.service.createQuery(context.params)

    // Join with user table
    query.leftJoin(userPath, `${userPath}.id`, '=', `${moderationPath}.reportedUserId`)

    // Add search conditions
    query
      .where(`${moderationPath}.referenceNumber`, 'like', `%${searchString}%`)
      .orWhere(`${userPath}.name`, 'like', `%${searchString}%`)

    context.params.knex = query
  }

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
      schemaHooks.resolveQuery(moderationQueryResolver)
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
