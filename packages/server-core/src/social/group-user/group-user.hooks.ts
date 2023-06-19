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

import { HookContext } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import groupPermissionAuthenticate from '@etherealengine/server-core/src/hooks/group-permission-authenticate'
import groupUserPermissionAuthenticate from '@etherealengine/server-core/src/hooks/group-user-permission-authenticate'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), groupUserPermissionAuthenticate() as any)],
    get: [disallow('external')],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    update: [disallow('external')],
    patch: [iff(isProvider('external'), groupUserPermissionAuthenticate() as any)],
    remove: [groupPermissionAuthenticate()]
  },

  after: {
    all: [],
    find: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        await Promise.all(
          result.data.map(async (groupUser) => {
            groupUser.user = await app.service('user').get(groupUser.userId)
          })
        )
        return context
      }
    ],
    get: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        result.user = await app.service('user').get(result.userId)
        return context
      }
    ],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        const user = await app.service('user').get(result.userId)
        await app.service('message').create(
          {
            targetObjectId: result.groupId,
            targetObjectType: 'group',
            text: `${user.name} joined the group`,
            isNotification: true
          },
          {
            'identity-provider': {
              userId: result.userId
            }
          } as any
        )
        return context
      }
    ],
    update: [],
    patch: [],
    remove: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, params, result } = context
        const user = await app.service('user').get(result.userId)
        await app.service('message').create({
          targetObjectId: result.groupId,
          targetObjectType: 'group',
          text: `${user.name} left the group`,
          isNotification: true
        })
        if (params.groupUsersRemoved !== true) {
          const groupUserCount = await app.service('group-user').find({
            query: {
              groupId: params.query!.groupId,
              $limit: 0
            }
          })
          if (groupUserCount.total < 1) {
            await app.service('group').remove(params.query!.groupId, params)
          }
          if (groupUserCount.total >= 1 && result.groupUserRank === 'owner') {
            const groupAdminResult = await app.service('group-user').find({
              query: {
                groupId: params.query!.groupId,
                groupUserRank: 'admin'
              }
            })
            if (groupAdminResult.total > 0) {
              const groupAdmins = groupAdminResult.data
              const newOwner = groupAdmins[Math.floor(Math.random() * groupAdmins.length)]
              await app.service('group-user').patch(newOwner.id, {
                groupUserRank: 'owner'
              })
            } else {
              const groupUserResult = await app.service('group-user').find({
                query: {
                  groupId: params.query!.groupId,
                  groupUserRank: 'user'
                }
              })
              const groupUsers = groupUserResult.data
              const newOwner = groupUsers[Math.floor(Math.random() * groupUsers.length)]
              await app.service('group-user').patch(newOwner.id, {
                groupUserRank: 'owner'
              })
            }
          }
        }
        return context
      }
    ]
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
