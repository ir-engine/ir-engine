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
import { getValidator } from '@feathersjs/typebox'
import { iff, isProvider } from 'feathers-hooks-common'

import {
  IdentityProviderType,
  identityProviderDataSchema,
  identityProviderPatchSchema,
  identityProviderPath,
  identityProviderQuerySchema,
  identityProviderSchema
} from '@etherealengine/engine/src/schemas/user/identity.provider.schema'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'
import { MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import authenticate from '../../hooks/authenticate'
import accountService from '../auth-management/auth-management.notifier'

import { Knex } from 'knex'
import {
  identityProviderDataResolver,
  identityProviderExternalResolver,
  identityProviderPatchResolver,
  identityProviderQueryResolver,
  identityProviderResolver
} from './identity-provider.resolvers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const identityProviderValidator = getValidator(identityProviderSchema, dataValidator)
const identityProviderDataValidator = getValidator(identityProviderDataSchema, dataValidator)
const identityProviderPatchValidator = getValidator(identityProviderPatchSchema, dataValidator)
const identityProviderQueryValidator = getValidator(identityProviderQuerySchema, queryValidator)

const isPasswordAccountType = () => {
  return (context: HookContext): boolean => {
    if (context.data.type === 'password') {
      return true
    }
    return false
  }
}

const sendVerifyEmail = () => {
  return (context: any): Promise<HookContext> => {
    accountService(context.app).notifier('resendVerifySignup', context.result)
    return context
  }
}

const checkIdentityProvider = (): any => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.id) {
      // If trying to CRUD a specific identity-provider, throw 404 if the user doesn't own it
      const knexClient: Knex = context.app.get('knexClient')
      const thisIdentityProvider = await knexClient.from(identityProviderPath).where({ id: context.id }).first()
      if (
        context.params[identityProviderPath] &&
        context.params[identityProviderPath].userId !== thisIdentityProvider.userId
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
    const knexClient: Knex = context.app.get('knexClient')
    const thisIdentityProvider = (await knexClient
      .from(identityProviderPath)
      .where({ id: context.id })
      .first()) as IdentityProviderType

    // we only want to disallow removing the last identity provider if it is not a guest
    // since the guest user will be destroyed once they log in
    if (thisIdentityProvider.type === 'guest') return context

    const providers = await context.app
      .service(identityProviderPath)
      .find({ query: { userId: thisIdentityProvider.userId } })

    if (providers.total <= 1) {
      throw new MethodNotAllowed('Cannot remove the only provider')
    }
    return context
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
    all: [],
    find: [
      iff(isProvider('external'), authenticate() as any),
      () => schemaHooks.validateQuery(identityProviderQueryValidator),
      schemaHooks.resolveQuery(identityProviderQueryResolver)
    ],
    get: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider())],
    create: [
      () => schemaHooks.validateData(identityProviderDataValidator),
      schemaHooks.resolveData(identityProviderDataResolver)
    ],
    update: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider())],
    patch: [
      iff(isProvider('external'), authenticate() as any, checkIdentityProvider()),
      () => schemaHooks.validateData(identityProviderPatchValidator),
      schemaHooks.resolveData(identityProviderPatchResolver)
    ],
    remove: [iff(isProvider('external'), authenticate() as any, checkIdentityProvider()), checkOnlyIdentityProvider()]
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
