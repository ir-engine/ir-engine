import groupPermissionAuthenticate from '@xrengine/server-core/src/hooks/group-permission-authenticate'
import groupUserPermissionAuthenticate from '@xrengine/server-core/src/hooks/group-user-permission-authenticate'
import * as authentication from '@feathersjs/authentication'
import { disallow, isProvider, iff } from 'feathers-hooks-common'
import { HookContext } from '@feathersjs/feathers'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [iff(isProvider('external'), groupUserPermissionAuthenticate() as any)],
    get: [],
    create: [disallow('external')],
    update: [],
    patch: [],
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
          }
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
