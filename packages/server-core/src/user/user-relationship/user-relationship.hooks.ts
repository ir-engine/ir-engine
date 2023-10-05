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

import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  UserRelationshipData,
  userRelationshipDataValidator,
  userRelationshipPatchValidator,
  userRelationshipPath,
  userRelationshipQueryValidator
} from '@etherealengine/engine/src/schemas/user/user-relationship.schema'

import { UserID, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import setLoggedInUserInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'
import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '../../../declarations'
import disallowNonId from '../../hooks/disallow-non-id'
import setLoggedinUserInBody from '../../hooks/set-loggedin-user-in-body'
import verifyUserId from '../../hooks/verify-userId'
import { UserRelationshipService } from './user-relationship.class'
import {
  userRelationshipDataResolver,
  userRelationshipExternalResolver,
  userRelationshipPatchResolver,
  userRelationshipQueryResolver,
  userRelationshipResolver
} from './user-relationship.resolvers'

/**
 * Ensure id passed in request is a valid user id
 * @param context
 * @returns
 */
const ensureValidRemoveId = async (context: HookContext<UserRelationshipService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const user = await context.app.service(userPath).get(context.id!)
  if (!user) {
    throw new BadRequest(`${context.path} service ${context.method} id should be user id`)
  }
}

/**
 * Update query such that user is removed from relationship both ways
 * @param context
 * @returns
 */
const updateQueryBothWays = async (context: HookContext<UserRelationshipService>) => {
  if (context.method !== 'remove') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const userId = context.params.user!.id

  context.params.query = {
    $or: [
      {
        userId,
        relatedUserId: context.id! as UserID
      },
      {
        userId: context.id! as UserID,
        relatedUserId: userId
      }
    ]
  }

  context.id = undefined
}

/**
 * Removes blocking relationship for the users
 * @param context
 * @returns
 */
const clearBlockingRelationships = async (context: HookContext<UserRelationshipService>) => {
  if (Array.isArray(context.data) || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for single object create`)
  }

  const { relatedUserId, userRelationshipType } = context.data as UserRelationshipData
  const user = context.params.user

  if (userRelationshipType === 'blocking') {
    context.app.service(userRelationshipPath).remove(relatedUserId, {
      user
    })
  }
}

/**
 * Update data such that certain relationships are created both ways
 * @param context
 * @returns
 */
const updateDataBothWays = async (context: HookContext<UserRelationshipService>) => {
  if (Array.isArray(context.data) || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for single object create`)
  }

  const { userId, relatedUserId, userRelationshipType } = context.data as UserRelationshipData

  if (userRelationshipType === 'blocking' || userRelationshipType === 'requested') {
    context.data = [
      context.data!,
      {
        ...context.data!,
        userId: relatedUserId,
        relatedUserId: userId,
        userRelationshipType: userRelationshipType === 'blocking' ? 'blocked' : 'pending'
      }
    ]
  }
}

/**
 * Ensure id passed in request is a user id or relationship id and then updated
 * query params based on that.
 * @param context
 * @returns
 */
const ensureValidPatchId = async (context: HookContext<UserRelationshipService>) => {
  if (context.method !== 'patch') {
    throw new BadRequest(`${context.path} service wrong hook in ${context.method}`)
  }

  const userId = context.params.user!.id

  const user = await context.app.service(userPath).get(context.id!)

  //The ID resolves to a userId, in which case patch the relation joining that user to the requesting one
  if (user) {
    context.params.query = {
      userId,
      relatedUserId: context.id as UserID
    }

    context.id = undefined
  }
}

/**
 * Update records such that after patch, certain relationships are created both ways
 * @param context
 * @returns
 */
const updatePatchBothWays = async (context: HookContext<UserRelationshipService>) => {
  if (Array.isArray(context.data) || context.method !== 'patch') {
    throw new BadRequest(`${context.path} service only works for single object patch`)
  }

  const { userId, relatedUserId, userRelationshipType } = context.data as UserRelationshipData

  if (
    (context.result || context.dispatch) &&
    (userRelationshipType === 'friend' || userRelationshipType === 'blocking')
  ) {
    context.service._patch(
      null,
      {
        userRelationshipType: userRelationshipType === 'friend' ? 'friend' : 'blocked'
      },
      {
        query: {
          userId: relatedUserId,
          relatedUserId: userId
        }
      }
    )
  }
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(userRelationshipExternalResolver),
      schemaHooks.resolveResult(userRelationshipResolver)
    ]
  },

  before: {
    all: [
      iff(isProvider('external'), authenticate() as any),
      () => schemaHooks.validateQuery(userRelationshipQueryValidator),
      schemaHooks.resolveQuery(userRelationshipQueryResolver)
    ],
    find: [iff(isProvider('external'), verifyUserId()), iff(isProvider('external'), setLoggedInUserInQuery('userId'))],
    get: [disallow()],
    create: [
      () => schemaHooks.validateData(userRelationshipDataValidator),
      setLoggedinUserInBody('userId'),
      clearBlockingRelationships,
      updateDataBothWays,
      // Calling resolver data later, such that the updated context.data in `updateDataBothWays` is resolved too
      schemaHooks.resolveData(userRelationshipDataResolver)
    ],
    update: [],
    patch: [
      () => schemaHooks.validateData(userRelationshipPatchValidator),
      schemaHooks.resolveData(userRelationshipPatchResolver),
      disallowNonId,
      setLoggedinUserInBody('userId'),
      ensureValidPatchId
    ],
    remove: [disallowNonId, ensureValidRemoveId, updateQueryBothWays]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [updatePatchBothWays],
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
