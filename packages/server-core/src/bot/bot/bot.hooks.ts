import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'
import logger from '../../logger'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [verifyScope('bot', 'read')],
    get: [verifyScope('bot', 'read')],
    create: [verifyScope('bot', 'write')],
    update: [verifyScope('bot', 'write'), disallow()],
    patch: [verifyScope('bot', 'write')],
    remove: [verifyScope('bot', 'write')]
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
