import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

import createGroupOwner from '@xrengine/server-core/src/hooks/create-group-owner'
import groupPermissionAuthenticate from '@xrengine/server-core/src/hooks/group-permission-authenticate'
import removeGroupUsers from '@xrengine/server-core/src/hooks/remove-group-users'

import authenticate from '../../hooks/authenticate'
import logger from '../../ServerLogger'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [disallow('external')],
    create: [],
    update: [groupPermissionAuthenticate()],
    patch: [
      groupPermissionAuthenticate(),
      async (context: HookContext): Promise<HookContext> => {
        if (context.arguments[1]?.scopes?.length > 0) {
          const foundItem = await (context.app.service('scope') as any).Model.findAll({
            where: {
              groupId: context.arguments[0]
            }
          })
          if (foundItem.length) {
            foundItem.forEach(async (scp) => {
              await context.app.service('scope').remove(scp.dataValues.id)
            })
          }
          const data = context.arguments[1]?.scopes?.map((el) => {
            return {
              type: el.type,
              groupId: context.arguments[0]
            }
          })
          await context.app.service('scope').create(data)
        }

        return context
      }
    ],
    remove: [groupPermissionAuthenticate(), removeGroupUsers()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      createGroupOwner(),
      async (context: HookContext): Promise<HookContext> => {
        try {
          const data = context.arguments[0]?.scopeTypes?.map((el) => {
            return {
              type: el.type,
              groupId: context.result.id
            }
          })
          await context.app.service('scope').create(data)

          return context
        } catch (err) {
          logger.error(err, `GROUP AFTER CREATE ERROR: ${err.error}`)
          return null!
        }
      }
    ],
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
