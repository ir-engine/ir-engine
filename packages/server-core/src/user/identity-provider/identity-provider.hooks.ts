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

import { BadRequest, Forbidden, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'
import { v4 } from 'uuid'

import { isDev } from '@ir-engine/common/src/config'
import { scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { scopePath, ScopeType } from '@ir-engine/common/src/schemas/scope/scope.schema'
import {
  IdentityProviderData,
  identityProviderDataValidator,
  identityProviderPatchValidator,
  identityProviderPath,
  identityProviderQueryValidator,
  IdentityProviderType
} from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { checkScope as checkScopeMethod } from '@ir-engine/common/src/utils/checkScope'
import checkScope from '../../hooks/check-scope'

import { Paginated } from '@feathersjs/feathers'
import { USER_ID_REGEX } from '@ir-engine/common/src/regex'
import {
  projectPath,
  projectPermissionPath,
  userApiKeyPath,
  UserApiKeyType,
  UserType
} from '@ir-engine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import appConfig from '../../appconfig'
import isAction from '../../hooks/is-action'
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

async function checkTokenAuth(context: HookContext<IdentityProviderService>, userId: UserID): Promise<boolean> {
  const authHeader = context.params.headers?.authorization
  if (authHeader) {
    let authSplit
    if (authHeader) {
      authSplit = authHeader.split(' ')
    }

    if (authSplit && authSplit.length > 1 && authSplit[1]) {
      const key = (await context.app.service(userApiKeyPath).find({
        query: {
          token: authSplit[1]
        }
      })) as Paginated<UserApiKeyType>

      if (key.data.length > 0) {
        const user = await context.app.service(userPath).get(key.data[0].userId)
        if (userId && userId !== user.id) throw new BadRequest('Cannot make identity-providers on other users')
        else return true
      }
    }
  }
  return false
}

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
      throw new Forbidden('Authenticated user is not owner of this identity provider')
  } else {
    const userId = context.params[identityProviderPath]?.userId
    if (!userId) {
      let isAuthenticated = await checkTokenAuth(context, userId)
      if (!isAuthenticated) {
        if (context.params.authentication) {
          try {
            await context.app.service('authentication').strategies.jwt.authenticate!(
              { accessToken: context.params.authentication.accessToken },
              {}
            )
          } catch (err) {
            throw new NotFound()
          }
        } else throw new NotFound()
      }
    }
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
  let existingUser

  try {
    if (userId) existingUser = await context.app.service(userPath).get(userId)
  } catch (err) {
    //
  }

  let isAuthenticated = await checkTokenAuth(context, userId)

  if (!isAuthenticated) {
    if (context.params.authentication) {
      const authResult = await context.app.service('authentication').strategies.jwt.authenticate!(
        { accessToken: context.params.authentication.accessToken },
        {}
      )
      if (userId !== '' && userId !== authResult[appConfig.authentication.entity]?.userId)
        throw new BadRequest('Cannot make identity-providers on other users')
    } else {
      if (userId && existingUser)
        throw new BadRequest('Cannot make identity-providers on existing users with no authentication')
    }
  }

  context.existingUser = existingUser
}

async function addIdentityProviderType(context: HookContext<IdentityProviderService>) {
  const isAdmin = context.existingUser && (await checkScopeMethod(context.existingUser, 'admin', 'admin'))
  let data = context.data as any
  let actualData = context.actualData
  if (
    !isAdmin &&
    context.params!.provider &&
    !['password', 'email', 'sms'].includes((context!.actualData as IdentityProviderData).type as string)
  ) {
    if (!USER_ID_REGEX.test(data.token as string))
      //Ensure that guest tokens are UUIDs
      data.token = v4()
    if (!USER_ID_REGEX.test(actualData.token as string))
      //Ensure that guest tokens are UUIDs
      actualData.token = v4()
    data.type = 'guest' //Non-password/magiclink create requests must always be for guests
    actualData.type = 'guest' //Non-password/magiclink create requests must always be for guests
  }

  if (data.type === 'guest') {
    if (actualData.userId) {
      const existingUser = await context.app.service(userPath).find({
        query: {
          id: actualData.userId
        }
      })
      if (existingUser.data.length > 0) {
        throw new BadRequest('Cannot create a guest identity-provider on an existing user')
      }
    }

    data = {
      id: data.id,
      token: data.token,
      type: data.type,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
    actualData = {
      id: actualData.id,
      token: actualData.token,
      type: actualData.type,
      userId: actualData.userId,
      createdAt: actualData.createdAt,
      updatedAt: actualData.updatedAt
    }
  }
  const adminScopes = await context.app.service(scopePath).find({
    query: {
      type: 'admin:admin' as ScopeType
    }
  })

  if (adminScopes.total === 0 && (isDev || actualData.type !== 'guest')) {
    context.isAdmin = true
  }
  context.data = data
  context.actualData = actualData
}

async function createNewUser(context: HookContext<IdentityProviderService>) {
  const isGuest = (context.actualData as IdentityProviderType).type === 'guest'
  context.existingUser = await context.app.service(userPath).create({
    isGuest
  })
}

/* (AFTER) CREATE HOOKS */

async function addScopes(context: HookContext<IdentityProviderService>) {
  if (isDev && context.isAdmin === true) {
    // in dev mode, add all scopes to the first user made an admin
    const scopeTypes = await context.app.service(scopeTypePath).find({
      paginate: false
    })

    const data = scopeTypes.map(({ type }) => {
      return { userId: context.existingUser!.id, type }
    })

    await context.app.service(scopePath).create(data)

    await context.app.service(userPath).patch(context.existingUser!.id, { isGuest: false })
  }
}

const addDevProjectPermissions = async (context: HookContext<IdentityProviderService>) => {
  if (!isDev || !(await checkScopeMethod(context.existingUser, 'admin', 'admin'))) return

  const user = context.existingUser as UserType

  const projects = await context.app.service(projectPath).find({ paginate: false })

  const staticResourcePermission = await context.app.service(scopePath).find({
    query: {
      userId: user.id,
      type: 'static_resource:write' as ScopeType
    }
  })

  if (staticResourcePermission.total > 0) {
    for (const project of projects) {
      await context.app.service(projectPermissionPath).create({
        projectId: project.id,
        userId: user.id,
        type: 'owner'
      })
    }
  }
}

async function createAccessToken(context: HookContext<IdentityProviderService>) {
  if (!(context.result as IdentityProviderType).accessToken) {
    ;(context.result as IdentityProviderType).accessToken = await context.app
      .service('authentication')
      .createAccessToken({}, { subject: (context.result as IdentityProviderType).id.toString() })
  }
}

const isSearchQuery = (context: HookContext) => {
  const { query } = context.params
  const queryLength = Object.keys(query).length
  // we only need to allow search based on exact email in the query
  return queryLength === 3 && query.email && !query.email.$like && !query.email.$notlike
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
      schemaHooks.validateQuery(identityProviderQueryValidator),
      schemaHooks.resolveQuery(identityProviderQueryResolver)
    ],
    find: [
      iff(
        isProvider('external'),
        iffElse(
          async (ctx: HookContext) =>
            (isAction('admin')(ctx) && (await checkScope('user', 'read')(ctx))) || isSearchQuery(ctx),
          [],
          [setLoggedinUserInQuery('userId')]
        )
      ),
      discardQuery('action')
    ],
    get: [iff(isProvider('external'), checkIdentityProvider)],
    create: [
      iff(
        (context: HookContext<IdentityProviderService>) => Array.isArray(context.data),
        () => {
          throw new MethodNotAllowed('identity-provider create works only with singular entries')
        }
      ),
      schemaHooks.validateData(identityProviderDataValidator),
      schemaHooks.resolveData(identityProviderDataResolver),
      persistData,
      validateAuthParams,
      addIdentityProviderType,
      iff((context: HookContext<IdentityProviderService>) => !context.existingUser, createNewUser),
      (context: HookContext<IdentityProviderService>) =>
        ((context.data as IdentityProviderData).userId = context.existingUser!.id)
    ],
    update: [disallow()],
    patch: [
      disallow('external'),
      schemaHooks.validateData(identityProviderPatchValidator),
      schemaHooks.resolveData(identityProviderPatchResolver)
    ],
    remove: [iff(isProvider('external'), checkIdentityProvider, checkOnlyIdentityProvider)]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [addScopes, addDevProjectPermissions, createAccessToken],
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
