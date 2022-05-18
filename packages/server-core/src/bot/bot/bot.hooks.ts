import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

import logger from '../../logger'

export default {
  before: {
    all: [],
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
          logger.error('BOT AFTER CREATE ERROR')
          logger.error(error)
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
