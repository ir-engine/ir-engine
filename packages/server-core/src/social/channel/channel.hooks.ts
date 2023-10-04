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

import { instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { ChannelUserType, channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import {
  ChannelData,
  ChannelID,
  ChannelType,
  channelDataValidator,
  channelPatchValidator,
  channelPath
} from '@etherealengine/engine/src/schemas/social/channel.schema'
import {
  UserRelationshipType,
  userRelationshipPath
} from '@etherealengine/engine/src/schemas/user/user-relationship.schema'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { disallow, discard, discardQuery, iff, iffElse, isProvider } from 'feathers-hooks-common'
import { Knex } from 'knex'
import { HookContext, HookResolver } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import enableClientPagination from '../../hooks/enable-client-pagination'
import isAction from '../../hooks/is-action'
import persistData from '../../hooks/persist-data'
import verifyScope from '../../hooks/verify-scope'
import verifyUserId from '../../hooks/verify-userId'
import { ChannelService } from './channel.class'
import {
  channelDataResolver,
  channelExternalResolver,
  channelPatchResolver,
  channelResolver
} from './channel.resolvers'

/**
 * Ensure user is owner of channel
 * @param context
 * @returns
 */
const ensureUserChannelOwner = async (context: HookContext<ChannelService>) => {
  const channelId = context.id as ChannelID
  if (!channelId) throw new BadRequest('Must pass id in request')

  const loggedInUser = context.params!.user!
  const channelUser = (await context.app.service(channelUserPath).find({
    query: {
      channelId,
      userId: loggedInUser.id,
      isOwner: true
    }
  })) as Paginated<ChannelUserType>

  if (channelUser.data.length === 0) throw new Forbidden('Must be owner to delete channel')

  return context
}

/**
 * Ensure user is part of channel-user
 * @param context
 * @returns
 */
const ensureUserHasChannelAccess = async (context: HookContext<ChannelService>) => {
  const channelId = context.id as ChannelID
  if (!channelId) throw new BadRequest('Must pass id in request')

  const loggedInUser = context.params!.user!
  const channelUser = (await context.app.service(channelUserPath).find({
    query: {
      channelId,
      userId: loggedInUser.id,
      $limit: 1
    }
  })) as Paginated<ChannelUserType>

  if (channelUser.data.length === 0) throw new Forbidden('Must be member of channel')

  return context
}

/**
 * Ensure users are friends of the owner
 * @param context
 * @returns
 */
const ensureUsersFriendWithOwner = async (context: HookResolver<ChannelService, ChannelData>) => {
  const users = context.data.users

  const loggedInUser = context.params!.user
  const userId = loggedInUser?.id

  if (!users || !userId) return context

  const userRelationships = (await context.app.service(userRelationshipPath)._find({
    query: {
      userId,
      userRelationshipType: 'friend',
      relatedUserId: {
        $in: users
      }
    },
    paginate: false
  })) as any as UserRelationshipType[]

  if (userRelationships.length !== users.length) {
    throw new Forbidden('Must be friends with all users to create channel')
  }

  return context
}

/**
 * Handle instanceId in request to join instance table
 * @param context
 * @returns
 */
const handleChannelInstance = async (context: HookContext<ChannelService>) => {
  const query = context.service.createQuery(context.params)

  if (context.params.query!.instanceId) {
    query
      .join(instancePath, `${instancePath}.id`, `${channelPath}.instanceId`)
      .where(`${instancePath}.id`, '=', context.params.query!.instanceId)
      .andWhere(`${instancePath}.ended`, '=', false)
  } else {
    const userId = context.params.user!.id

    query
      .leftJoin(instancePath, `${instancePath}.id`, `${channelPath}.instanceId`)
      .join(channelUserPath, `${channelPath}.id`, `${channelUserPath}.channelId`)
      .where(`${instancePath}.ended`, '=', false)
      .orWhereNull(`${channelPath}.instanceId`)
      .andWhere(`${channelUserPath}.userId`, '=', userId)
  }

  context.params.knex = query
}

/**
 * Checks if there is an existing channel for same users.
 * This hook works only if it was a non-instance channel.
 * @param context
 * @returns
 */
const checkExistingChannel = async (context: HookResolver<ChannelService, ChannelData, ChannelType>) => {
  const { users, instanceId } = context.data
  const userId = context.params.user?.id

  if (!instanceId && users?.length) {
    // get channel that contains the same users
    const userIds = users.filter(Boolean)
    if (userId) userIds.push(userId)

    const knexClient: Knex = context.app.get('knexClient')
    const existingChannel: ChannelType = await knexClient(channelPath)
      .select(`${channelPath}.*`)
      .leftJoin(channelUserPath, `${channelPath}.id`, '=', `${channelUserPath}.channelId`)
      .whereNull(`${channelPath}.instanceId`)
      .andWhere((builder) => {
        builder.whereIn(`${channelUserPath}.userId`, userIds)
      })
      .groupBy(`${channelPath}.id`)
      .havingRaw('count(*) = ?', [userIds.length])
      .first()

    if (existingChannel) {
      context.result = existingChannel
      context.existingData = true
    }
  }

  return context
}

/**
 * Set the channel name based on instanceId
 * @param context
 * @returns
 */
const setChannelName = async (context: HookResolver<ChannelService, ChannelData>) => {
  context.data.name = context.data.instanceId ? 'World ' + context.data.instanceId : context.data.name || ''
}

/**
 * Makes the requesting user owner of the channel
 * @param context
 * @returns
 */
const createSelfOwner = async (context: HookContext) => {
  const userId = context.params.user?.id

  if (userId) {
    await context.app.service(channelUserPath).create({
      channelId: context.result.id as ChannelID,
      userId,
      isOwner: true
    })
  }

  return context
}

/**
 * Created specified users members of the channel
 * @param context
 * @returns
 */
const createChannelUsers = async (context: HookResolver<ChannelService, ChannelData, ChannelType>) => {
  /** @todo ensure all users specified are friends of loggedInUser */

  if (context.actualData && context.actualData.users) {
    await Promise.all(
      context.actualData.users.map(async (user) =>
        context.app.service(channelUserPath).create({
          channelId: context.result!.id as ChannelID,
          userId: user
        })
      )
    )
  }

  return context
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(channelExternalResolver), schemaHooks.resolveResult(channelResolver)]
  },

  before: {
    all: [authenticate()],
    find: [
      enableClientPagination(),
      iff(isProvider('external'), verifyUserId()),
      iff(isProvider('external'), iffElse(isAction('admin'), verifyScope('admin', 'admin'), handleChannelInstance)),
      discardQuery('action')
    ],
    get: [setLoggedInUser('userId'), iff(isProvider('external'), ensureUserHasChannelAccess)],
    create: [
      () => schemaHooks.validateData(channelDataValidator),
      schemaHooks.resolveData(channelDataResolver),
      iff(isProvider('external'), ensureUsersFriendWithOwner),
      checkExistingChannel,
      // Below if is to check if existing channel was found or not
      iff((context) => !context.existingData, persistData, discard('users') as any, setChannelName)
    ],
    update: [disallow('external')],
    patch: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateData(channelPatchValidator),
      schemaHooks.resolveData(channelPatchResolver)
    ],
    remove: [iff(isProvider('external'), ensureUserChannelOwner)]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [iff((context) => !context.existingData, createSelfOwner, createChannelUsers)],
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
