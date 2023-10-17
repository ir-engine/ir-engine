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
import { disallow, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  AvatarType,
  avatarDataValidator,
  avatarPatchValidator,
  avatarPath,
  avatarQueryValidator
} from '@etherealengine/engine/src/schemas/user/avatar.schema'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import logger from '../../ServerLogger'

import { staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { HookContext } from '../../../declarations'
import disallowNonId from '../../hooks/disallow-non-id'
import isAction from '../../hooks/is-action'
import verifyScope from '../../hooks/verify-scope'
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
  } else {
    context.params.query = {
      ...context.params?.query,
      isPublic: true
    }
  }

  return context
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

  return context
}

/**
 * Users that have the avatar that's being deleted will have theirs replaced with
 * a random one, if there are other avatars to use.
 * @param context
 * @returns
 */
const updateUserAvatars = async (context: HookContext<AvatarService>) => {
  const avatars = (await context.app.service(avatarPath).find({
    query: {
      id: {
        $ne: context.id?.toString()
      }
    },
    paginate: false
  })) as AvatarType[]

  if (avatars.length > 0) {
    const randomReplacementAvatar = avatars[Math.floor(Math.random() * avatars.length)]
    await context.app.service(userPath).patch(
      null,
      {
        avatarId: randomReplacementAvatar.id
      },
      {
        query: {
          avatarId: context.id?.toString()
        }
      }
    )
  }
}

const addAndSortByUserName = async (context: HookContext<AvatarService>) => {
  if (!context.params.query) return

  const userNameAlias = 'userName'

  const sort = context.params.query.$sort?.['owner']
  delete context.params.query.$sort?.['owner']
  const nameLike = context.params.query.name as any
  delete context.params.query.name

  const query = context.service.createQuery(context.params)

  query.leftJoin(userPath, `${userPath}.id`, `${avatarPath}.userId`)
  if (nameLike) {
    query.where(`${avatarPath}.name`, 'LIKE', nameLike.$like)
  }
  query.orderBy(`${userPath}.name`, sort === 1 ? 'asc' : 'desc')
  query.select(`${avatarPath}.*`, `${userPath}.name AS ${userNameAlias}`)

  context.params.knex = query
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(avatarExternalResolver), schemaHooks.resolveResult(avatarResolver)]
  },

  before: {
    all: [() => schemaHooks.validateQuery(avatarQueryValidator), schemaHooks.resolveQuery(avatarQueryResolver)],
    find: [
      iffElse(isAction('admin'), verifyScope('admin', 'admin'), ensureUserAccessibleAvatars),
      discardQuery('action'),
      addAndSortByUserName
    ],
    get: [],
    create: [
      () => schemaHooks.validateData(avatarDataValidator),
      schemaHooks.resolveData(avatarDataResolver),
      setLoggedInUser('userId')
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateData(avatarPatchValidator),
      schemaHooks.resolveData(avatarPatchResolver)
    ],
    remove: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
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
