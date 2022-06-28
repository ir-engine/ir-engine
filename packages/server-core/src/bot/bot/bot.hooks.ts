import { HookContext } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'
import logger from '../../logger'

export default {
  before: {
    all: [authenticate(), iff(isProvider('external'), restrictUserRole('admin') as any)],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        try {
          const command = context.arguments[0]?.command
          const bot = context.result.id
          command.forEach(async (element: any) => {
            await context.app.service('bot-command').create({
              name: element.name,
              description: element.description,
              botId: bot
            })
          })
          return context
        } catch (error) {
          logger.error(error, 'BOT AFTER CREATE ERROR')
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
