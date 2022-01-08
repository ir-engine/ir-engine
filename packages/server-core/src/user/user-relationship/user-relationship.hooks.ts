import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
import * as commonHooks from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [commonHooks.iff(commonHooks.isProvider('external'), authenticate('jwt') as any)],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context: HookContext): Promise<HookContext> => {
        const { app, result } = context
        const user = await app.service('user').get(result.userId)
        await app.service('message').create(
          {
            targetObjectId: result.relatedUserId,
            targetObjectType: 'user',
            text: 'Hey friend!',
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
