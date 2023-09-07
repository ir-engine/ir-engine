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

import { ChannelUserType, channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import { channelDataValidator, channelPatchValidator } from '@etherealengine/engine/src/schemas/social/channel.schema'
import {
  UserRelationshipType,
  userRelationshipPath
} from '@etherealengine/engine/src/schemas/user/user-relationship.schema'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'
import { NextFunction, Paginated } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'
import { HookContext } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import {
  channelDataResolver,
  channelExternalResolver,
  channelPatchResolver,
  channelResolver
} from './channel.resolvers'

/**
 *  Don't remove this comment. It's needed to format import lines nicely.
 *
 */

const applyInstanceIpAddressSort = async (context: HookContext, next: NextFunction) => {
  await next() // Read more about execution of hooks: https://github.com/feathersjs/hooks#flow-control-with-multiple-hooks

  const hasInstanceSort =
    context.params.query && context.params.query.$sort && context.params.query.$sort['instanceIpAddress']

  if (hasInstanceSort) {
    const { dispatch } = context
    const data = dispatch.data ? dispatch.data : dispatch

    data.sort((a, b) => {
      let fa = a['instanceIpAddress'],
        fb = b['instanceIpAddress']

      if (typeof fa === 'string') {
        fa = fa.toLowerCase()
        fb = fb.toLowerCase()
      }

      if (fa < fb) {
        return -1
      }
      if (fa > fb) {
        return 1
      }
      return 0
    })

    if (context.params.query.$sort['instanceIpAddress'] === 1) {
      data.reverse()
    }
  }
}

export default {
  around: {
    all: [
      applyInstanceIpAddressSort,
      schemaHooks.resolveExternal(channelExternalResolver),
      schemaHooks.resolveResult(channelResolver)
    ]
  },

  before: {
    all: [authenticate()],
    find: [],
    get: [
      setLoggedInUser('userId'),
      iff(isProvider('external'), async (context: HookContext) => {
        const channelID = context.arguments[0]
        if (!channelID) return context

        const loggedInUser = context.params!.user
        const channelUser = (await context.app.service(channelUserPath).find({
          query: {
            channelId: channelID,
            userId: loggedInUser.id,
            $limit: 1
          }
        })) as Paginated<ChannelUserType>

        if (channelUser.data.length === 0) throw new Error('Must be member of channel!')

        return context
      })
    ],
    create: [
      () => schemaHooks.validateData(channelDataValidator),
      schemaHooks.resolveData(channelDataResolver),
      setLoggedInUser('userId'),
      // ensure users are friends of the owner
      iff(isProvider('external'), async (context: HookContext) => {
        const data = context.data
        const users = data.users

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
          throw new Error('Must be friends with all users to create channel!')
        }

        return context
      })
    ],
    update: [disallow('external')],
    patch: [
      disallow('external'),
      () => schemaHooks.validateData(channelPatchValidator),
      schemaHooks.resolveData(channelPatchResolver)
    ],
    remove: [setLoggedInUser('userId')]
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
