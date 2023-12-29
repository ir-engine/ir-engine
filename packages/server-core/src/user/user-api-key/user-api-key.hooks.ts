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

import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  userApiKeyDataSchema,
  userApiKeyPatchSchema,
  userApiKeyQuerySchema,
  userApiKeySchema
} from '@etherealengine/engine/src/schemas/user/user-api-key.schema'

import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import { BadRequest } from '@feathersjs/errors'
import { getValidator } from '@feathersjs/typebox'
import { HookContext } from '../../../declarations'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'
import { UserApiKeyService } from './user-api-key.class'
import {
  userApiKeyDataResolver,
  userApiKeyExternalResolver,
  userApiKeyPatchResolver,
  userApiKeyQueryResolver,
  userApiKeyResolver
} from './user-api-key.resolvers'

const userApiKeyValidator = getValidator(userApiKeySchema, dataValidator)
const userApiKeyDataValidator = getValidator(userApiKeyDataSchema, dataValidator)
const userApiKeyPatchValidator = getValidator(userApiKeyPatchSchema, dataValidator)
const userApiKeyQueryValidator = getValidator(userApiKeyQuerySchema, queryValidator)

/**
 * Ensure user is modifying their own api key
 * @param context
 * @returns
 */
const ensureUserOwnsApiKey = async (context: HookContext<UserApiKeyService>) => {
  if (context.method !== 'patch') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  if (context.id) {
    const userApiKey = await context.service.get(context.id)
    if (userApiKey.userId !== context.params.user!.id) {
      throw new BadRequest(`${context.path} service ${context.id} not owned by user`)
    }
  }
}

/**
 * Ensure user does not already own an api key
 * @param context
 * @returns
 */
const ensureUserDoesNotHaveApiKey = async (context: HookContext<UserApiKeyService>) => {
  if (context.method !== 'create') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const userId = context.params.user!.id

  const userApiKey = await context.service.find({
    query: {
      userId
    }
  })

  if (userApiKey.data.length > 0) {
    throw new BadRequest(`${context.path} service user already owns an api key`)
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(userApiKeyExternalResolver), schemaHooks.resolveResult(userApiKeyResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(userApiKeyQueryValidator), schemaHooks.resolveQuery(userApiKeyQueryResolver)],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId'))],
    create: [
      () => schemaHooks.validateData(userApiKeyDataValidator),
      schemaHooks.resolveData(userApiKeyDataResolver),
      iff(isProvider('external'), ensureUserDoesNotHaveApiKey),
      iff(isProvider('external'), setLoggedInUser('userId'))
    ],
    update: [disallow('external')],
    patch: [
      () => schemaHooks.validateData(userApiKeyPatchValidator),
      schemaHooks.resolveData(userApiKeyPatchResolver),
      iff(isProvider('external'), ensureUserOwnsApiKey),
      iff(isProvider('external'), attachOwnerIdInQuery('userId')),
      iff(isProvider('external'), setLoggedInUser('userId'))
    ],
    remove: [disallow('external')]
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
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
