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

import { BadRequest, Forbidden } from '@feathersjs/errors'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import {
  avatarDataValidator,
  AvatarID,
  avatarPatchValidator,
  avatarPath,
  AvatarQuery,
  avatarQueryValidator,
  AvatarType
} from '@ir-engine/common/src/schemas/user/avatar.schema'
import { userAvatarPath } from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import setLoggedInUser from '@ir-engine/server-core/src/hooks/set-loggedin-user-in-body'
import { checkScope } from '@ir-engine/common/src/utils/checkScope'

import { HookContext } from '../../../declarations'
import disallowNonId from '../../hooks/disallow-non-id'
import isAction from '../../hooks/is-action'
import { checkRefreshMode } from '../../hooks/is-refresh-mode'
import persistQuery from '../../hooks/persist-query'
import verifyScope from '../../hooks/verify-scope'
import logger from '../../ServerLogger'
import { AvatarService } from './avatar.class'
import {
  avatarDataResolver,
  avatarExternalResolver,
  avatarPatchResolver,
  avatarQueryResolver,
  avatarResolver
} from './avatar.resolvers'

/**
 * Set identifier name based on name and id
 * @param context
 * @returns
 */
const setIdentifierName = async (context: HookContext<AvatarService>) => {
  const process = async (item: AvatarType) => {
    const updatedAvatar = await context.app.service(avatarPath).patch(item.id, {
      identifierName: item.name + '_' + item.id
    })

    return { ...item, ...updatedAvatar }
  }

  context.result = Array.isArray(context.result)
    ? await Promise.all(context.result.map(process))
    : await process(context.result as AvatarType)
}

/**
 * Updates query params to restrict access to avatars based on userId
 * @param context
 * @returns
 */
const ensureUserAccessibleAvatars = async (context: HookContext<AvatarService>) => {
  if (context.params.user && context.params.user.id) {
    if (context.params.query?.$or) {
      const orQuery: AvatarQuery['$or'] = []

      for (const item of context.params.query.$or) {
        orQuery.push({
          ...item,
          isPublic: true
        })
        orQuery.push({
          ...item,
          isPublic: false,
          userId: context.params.user.id
        })
      }

      context.params.query.$or = orQuery
    } else {
      context.params.query = {
        ...context.params?.query,
        $or: [
          ...(context.params?.query?.$or || []),
          {
            isPublic: true
          },
          {
            isPublic: false,
            userId: context.params.user.id
          }
        ]
      }
    }
  } else {
    context.params.query = {
      ...context.params?.query,
      isPublic: true
    }
  }
}

const checkUserHasPermissionOrIsOwner = async (context: HookContext<AvatarService>) => {
  const hasAvatarWriteScope = await checkScope(context.params.user!, 'globalAvatars', 'write')
  if (hasAvatarWriteScope) {
    return
  }

  const foundAvatar = await context.app.service(avatarPath).get(context.id!)
  if (!foundAvatar) {
    throw new BadRequest('Avatar not found')
  }

  if (foundAvatar.userId !== context.params.user?.id) {
    throw new Forbidden('User is not owner of this avatar')
  }

  context.data = { ...context.data, userId: context.params.user.id }
}

const sortByUserName = async (context: HookContext<AvatarService>) => {
  if (!context.params.query || !context.params.query.$sort?.['user']) return

  const userSort = context.params.query.$sort['user']
  delete context.params.query.$sort['user']

  if (context.params.query.name) {
    context.params.query[`${avatarPath}.name`] = context.params.query.name
    delete context.params.query.name
  }

  const query = context.service.createQuery(context.params)

  query.leftJoin(userPath, `${userPath}.id`, `${avatarPath}.userId`)
  query.orderBy(`${userPath}.name`, userSort === 1 ? 'asc' : 'desc')

  context.params.knex = query
}

/**
 * Remove avatar resources from storage provider
 * @param context
 * @returns
 */
const removeAvatarResources = async (context: HookContext<AvatarService>) => {
  const avatar = await context.app.service(avatarPath).get(context.id!, context.params)

  try {
    await context.app.service(staticResourcePath).remove(avatar.modelResourceId)
  } catch (err) {
    logger.error(err)
  }

  try {
    await context.app.service(staticResourcePath).remove(avatar.thumbnailResourceId)
  } catch (err) {
    logger.error(err)
  }
}

/**
 * Users that have the avatar that's being deleted will have theirs replaced with
 * a random one, if there are other avatars to use.
 * @param context
 * @returns
 */
const updateUserAvatars = async (context: HookContext<AvatarService>) => {
  const avatars = await context.app.service(avatarPath).find({
    query: {
      id: {
        $ne: context.id?.toString() as AvatarID
      },
      isPublic: true,
      $limit: 1000
    }
  })

  if (avatars.data.length > 0) {
    const randomReplacementAvatar = avatars.data[Math.floor(Math.random() * avatars.data.length)]
    await context.app.service(userAvatarPath).patch(
      null,
      {
        avatarId: randomReplacementAvatar.id as AvatarID
      },
      {
        query: {
          avatarId: context.id?.toString() as AvatarID
        },
        user: context.params.user
      }
    )
  }
}

/**
 * Hook used to check if request has any public avatar in data.
 */
const isPublicAvatar = () => {
  return (context: HookContext) => {
    const data: AvatarType[] = Array.isArray(context.data) ? context.data : [context.data]

    const hasPublic = data.find((item) => item.isPublic)

    return !!hasPublic
  }
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(avatarExternalResolver), schemaHooks.resolveResult(avatarResolver)]
  },

  before: {
    all: [schemaHooks.validateQuery(avatarQueryValidator), schemaHooks.resolveQuery(avatarQueryResolver)],
    find: [
      iffElse(isAction('admin'), verifyScope('globalAvatars', 'read'), ensureUserAccessibleAvatars),
      persistQuery,
      discardQuery('action'),
      discardQuery('skipUser'),
      sortByUserName
    ],
    get: [persistQuery, discardQuery('skipUser')],
    create: [
      iff(isProvider('external') && !checkRefreshMode() && isPublicAvatar(), verifyScope('globalAvatars', 'write')),
      schemaHooks.validateData(avatarDataValidator),
      schemaHooks.resolveData(avatarDataResolver),
      setLoggedInUser('userId')
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), checkUserHasPermissionOrIsOwner),
      schemaHooks.validateData(avatarPatchValidator),
      schemaHooks.resolveData(avatarPatchResolver)
    ],
    remove: [
      iff(isProvider('external'), verifyScope('globalAvatars', 'write')),
      disallowNonId,
      removeAvatarResources,
      updateUserAvatars
    ]
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [setIdentifierName],
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
