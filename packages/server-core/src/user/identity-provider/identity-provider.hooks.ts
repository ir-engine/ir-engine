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

import {
  IdentityProviderData,
  IdentityProviderType,
  identityProviderDataValidator,
  identityProviderPatchValidator,
  identityProviderPath,
  identityProviderQueryValidator
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { BadRequest, Forbidden, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'
import appConfig from '../../appconfig'

import { isDev } from '@etherealengine/common/src/config'
import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import { scopeTypePath } from '@etherealengine/engine/src/schemas/scope/scope-type.schema'
import { scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { random } from 'lodash'
import { HookContext } from '../../../declarations'
import persistData from '../../hooks/persist-data'
import setLoggedinUserInQuery from '../../hooks/set-loggedin-user-in-query'
import { IdentityProviderService } from './identity-provider.class'
import {
  identityProviderDataResolver,
  identityProviderExternalResolver,
  identityProviderPatchResolver,
  identityProviderQueryResolver,
  identityProviderResolver
} from './identity-provider.resolvers'

/**
 * If trying to CRUD multiple identity-providers (e.g. patch all IP's belonging to a user),
 * make `params.query.userId` the ID of the calling user, so no one can alter anyone else's IPs.
 */
async function checkIdentityProvider(context: HookContext<IdentityProviderService>): Promise<HookContext> {
  if (context.id) {
    const thisIdentityProvider = await context.app.service(identityProviderPath).get(context.id)
    if (
      !context.params.user ||
      !thisIdentityProvider ||
      (context.params.user && thisIdentityProvider && context.params.user.id !== thisIdentityProvider.userId)
    )
      throw new MethodNotAllowed('authenticated user is not owner of this identity provider')
  } else {
    const userId = context.params[identityProviderPath]?.userId
    if (!userId) throw new NotFound()
    if (!context.params.query) context.params.query = {}
    context.params.query.userId = userId
  }
  return context
}

/**
 * do not allow to remove the identity providers in bulk
 * and we want to disallow removing the last identity provider for non-guest users
 */
async function checkOnlyIdentityProvider(context: HookContext<IdentityProviderService>) {
  if (!context.id) {
    throw new MethodNotAllowed('Cannot remove multiple providers together')
  }
  const thisIdentityProvider = await context.app.service(identityProviderPath).get(context.id)

  if (!thisIdentityProvider) throw new Forbidden('You do not have any identity provider')

  if (thisIdentityProvider.type === 'guest') return context

  const providers = await context.app
    .service(identityProviderPath)
    .find({ query: { userId: thisIdentityProvider.userId } })

  if (providers.total <= 1) {
    throw new MethodNotAllowed('Cannot remove the only identity provider on a user')
  }
  return context
}

/* (BEFORE) CREATE HOOKS */

async function validateAuthParams(context: HookContext<IdentityProviderService>) {
  let userId = (context.actualData as IdentityProviderData).userId

  if (context.params.authentication) {
    const authResult = await context.app.service('authentication').strategies.jwt.authenticate!(
      { accessToken: context.params.authentication.accessToken },
      {}
    )
    userId = userId || authResult[appConfig.authentication.entity]?.userId
  }

  if (!userId) {
    if ((context.actualData as IdentityProviderData).type === 'guest') {
      return
    }
    throw new BadRequest('userId not found')
  }

  context.existingUser = await context.app.service(userPath).get(userId)
}

async function addIdentityProviderType(context: HookContext<IdentityProviderService>) {
  const isAdmin = context.existingUser && (await checkScope(context.existingUser, 'admin', 'admin'))
  if (
    !isAdmin &&
    context.params!.provider &&
    !['password', 'email', 'sms'].includes((context!.actualData as IdentityProviderData).type)
  ) {
    ;(context.actualData as IdentityProviderData).type = 'guest' //Non-password/magiclink create requests must always be for guests
  }

  const adminScopes = await context.app.service(scopePath).find({
    query: {
      type: 'admin:admin' // DOUBT: what happens here
    }
  })

  if (adminScopes.total === 0 && (isDev || (context.actualData as IdentityProviderData).type !== 'guest')) {
    ;(context.actualData as IdentityProviderData).type = 'admin'
  }
}

async function createNewUser(context: HookContext<IdentityProviderService>) {
  const isGuest = (context.actualData as IdentityProviderType).type === 'guest'
  const avatars = await context.app.service(avatarPath).find({ isInternal: true, query: { $limit: 1000 } })

  const newUser = await context.app.service(userPath).create({
    isGuest,
    avatarId: avatars.data[random(avatars.data.length - 1)].id
  })

  context.existingUser = newUser
}

/* (AFTER) CREATE HOOKS */

async function addScopes(context: HookContext<IdentityProviderService>) {
  if (isDev && (context.actualData as IdentityProviderType).type === 'admin') {
    // in dev mode, add all scopes to the first user made an admin
    const scopeTypes = await context.app.service(scopeTypePath).find({
      paginate: false
    })

    const data = scopeTypes.map(({ type }) => {
      return { userId: context.existingUser!.id, type }
    })

    await context.app.service(scopePath).create(data)
  }
}

async function createAccessToken(context: HookContext<IdentityProviderService>) {
  if (!(context.result as IdentityProviderType).accessToken) {
    ;(context.result as IdentityProviderType).accessToken = await context.app
      .service('authentication')
      .createAccessToken({}, { subject: (context.result as IdentityProviderType).id.toString() })
  }
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(identityProviderExternalResolver),
      schemaHooks.resolveResult(identityProviderResolver)
    ]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(identityProviderQueryValidator),
      schemaHooks.resolveQuery(identityProviderQueryResolver)
    ],
    find: [iff(isProvider('external'), setLoggedinUserInQuery('userId'))],
    get: [iff(isProvider('external'), checkIdentityProvider)],
    create: [
      iff(
        (context: HookContext<IdentityProviderService>) => Array.isArray(context.data),
        () => {
          throw new MethodNotAllowed('identity-provider create works only with singular entries')
        }
      ),
      () => schemaHooks.validateData(identityProviderDataValidator),
      schemaHooks.resolveData(identityProviderDataResolver),
      persistData,
      validateAuthParams,
      addIdentityProviderType,
      iff((context: HookContext<IdentityProviderService>) => !context.existingUser, createNewUser),
      (context: HookContext<IdentityProviderService>) =>
        ((context.data as IdentityProviderData).userId = context.existingUser!.id)
    ],
    update: [iff(isProvider('external'), checkIdentityProvider)],
    patch: [
      iff(isProvider('external'), checkIdentityProvider),
      () => schemaHooks.validateData(identityProviderPatchValidator),
      schemaHooks.resolveData(identityProviderPatchResolver)
    ],
    remove: [iff(isProvider('external'), checkIdentityProvider, checkOnlyIdentityProvider)]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [addScopes, createAccessToken],
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
