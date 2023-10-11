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
  IdentityProviderType,
  identityProviderDataValidator,
  identityProviderPatchValidator,
  identityProviderPath,
  identityProviderQueryValidator
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { Forbidden, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'
import appConfig from '../../appconfig'

import { isDev } from '@etherealengine/common/src/config'
import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import { scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { random } from 'lodash'
import { Application } from '../../../declarations'
import { scopeTypeSeed } from '../../scope/scope-type/scope-type.seed'
import {
  identityProviderDataResolver,
  identityProviderExternalResolver,
  identityProviderPatchResolver,
  identityProviderQueryResolver,
  identityProviderResolver
} from './identity-provider.resolvers'

const checkIdentityProvider = (): any => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.id) {
      // If trying to CRUD a specific identity-provider, throw 404 if the user doesn't own it
      const thisIdentityProvider = (await context.app
        .service(identityProviderPath)
        .get(context.id)) as IdentityProviderType
      if (
        !context.params.user ||
        !thisIdentityProvider ||
        (context.params.user && thisIdentityProvider && context.params.user.id !== thisIdentityProvider.userId)
      )
        throw new NotFound()
    } else {
      // If trying to CRUD multiple identity-providers, e.g. patch all IP's belonging to a user, make params.query.userId
      // the ID of the calling user, so no one can alter anyone else's IPs.
      const userId = context.params[identityProviderPath]?.userId
      if (!userId) throw new NotFound()
      if (!context.params.query) context.params.query = {}
      context.params.query.userId = userId
    }
    if (context.data) context.data = { password: context.data.password } //If patching externally, should only be able to change password
    return context
  }
}

const checkOnlyIdentityProvider = () => {
  return async (context: HookContext): Promise<HookContext> => {
    if (!context.id) {
      // do not allow to remove identity providers in bulk
      throw new MethodNotAllowed('Cannot remove multiple providers together')
    }
    const thisIdentityProvider = (await context.app
      .service(identityProviderPath)
      .get(context.id)) as IdentityProviderType

    if (!thisIdentityProvider) throw new Forbidden('You do not have any identity provider')

    // we only want to disallow removing the last identity provider if it is not a guest
    // since the guest user will be destroyed once they log in
    if (thisIdentityProvider.type === 'guest') return context

    const providers = await context.app
      .service(identityProviderPath)
      .find({ query: { userId: thisIdentityProvider.userId } })

    if (providers.total <= 1) {
      throw new MethodNotAllowed('Cannot remove the only identity provider on a user')
    }
    return context
  }
}

function addUserId(key: 'data' | 'query') {
  return (context: HookContext) => {
    if (key === 'data') {
      context.data.userId = context.existingUser!.id
    } else {
      if (context.params.provider) context.params.query.userId = context.params.user!.id
    }
  }
}

/** (BEFORE) CREATE HOOKS **/

// async function validateAuthParams(context:HookContext<IdentityProviderService>) {
async function validateAuthParams(context: HookContext) {
  let userId = context.data.userId

  if (context.params.authentication) {
    const authResult = await (context.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: context.params.authentication.accessToken },
      {}
    )
    userId = userId || authResult[appConfig.authentication.entity]?.userId
  }

  if (!userId) {
    return
  }

  const user = await context.app.service(userPath).get(userId)

  context.existingUser = user
}

async function addIdentityProviderType(context: HookContext) {
  const isAdmin = context.existingUser && (await checkScope(context.existingUser, 'admin', 'admin'))
  if (!isAdmin && context.params!.provider && !['password', 'email', 'sms'].includes(context.data.type)) {
    context.data.type = 'guest'
  }

  const adminScopes = await context.app.service(scopePath).find({
    query: {
      type: 'admin:admin'
    }
  })

  if (adminScopes.total === 0 && isDev && context.data.type !== 'guest') {
    // doubt here - it should be the first if condition
    context.data.type = 'admin'
  }
}

async function createNewUser(context: HookContext) {
  const isGuest = context.data.type === 'guest'
  const avatars = await context.app.service(avatarPath).find({ isInternal: true, query: { $limit: 1000 } } as any)

  const newUser = await context.app.service(userPath).create({
    isGuest,
    avatarId: avatars.data[random(avatars.data.length - 1)].id
  })

  context.existingUser = newUser
}

/** (AFTER) CREATE HOOKS **/

async function addScopes(context: HookContext) {
  if (context.data.type === 'guest' && appConfig.scopes.guest.length) {
    const data = appConfig.scopes.guest.map((el) => ({
      type: el,
      userId: context.existingUser!.id
    }))
    await context.app.service(scopePath).create(data)
  }

  if (isDev && context.data.type === 'admin') {
    const data = scopeTypeSeed.map(({ type }) => ({ userId: context.existingUser!.id, type }))
    await context.app.service(scopePath).create(data)
  }
}

async function createAccessToken(context: HookContext) {
  if (!context.result!.accessToken) {
    context.result.accessToken = await (context.app as Application)
      .service('authentication')
      .createAccessToken({}, { subject: context.result.id.toString() })
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
    find: [addUserId('query')],
    get: [iff(isProvider('external'), checkIdentityProvider())],
    create: [
      () => schemaHooks.validateData(identityProviderDataValidator),
      schemaHooks.resolveData(identityProviderDataResolver),
      validateAuthParams,
      addIdentityProviderType,
      iff((context: HookContext) => !context.existingUser, createNewUser),
      addUserId('data')
    ],
    update: [iff(isProvider('external'), checkIdentityProvider())],
    patch: [
      iff(isProvider('external'), checkIdentityProvider()),
      () => schemaHooks.validateData(identityProviderPatchValidator),
      schemaHooks.resolveData(identityProviderPatchResolver)
    ],
    remove: [iff(isProvider('external'), checkIdentityProvider()), checkOnlyIdentityProvider()]
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
