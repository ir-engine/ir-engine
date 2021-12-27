import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import { HookContext } from '@feathersjs/feathers'
import * as authentication from '@feathersjs/authentication'

const logRequest = (options = {}) => {
  return async (context: HookContext): Promise<HookContext> => {
    const { data, params } = context
    if (context.error) {
      console.log('***** Error')
      console.log(context.error)
    }
    const body = params.body || {}
    console.log(body)
    return context
  }
}

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [
      addAssociations({
        models: [
          {
            model: 'inventory-item-type'
          },
          {
            model: 'user'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'inventory-item-type'
          },
          {
            model: 'user'
          }
        ]
      })
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      // processInventoryEntities()
      (context: HookContext): HookContext => {
        try {
          if (context.result?.data[0]?.metadata) {
            for (let x = 0; x < context.result.data.length; x++) {
              context.result.data[x].metadata = JSON.parse(context.result.data[x].metadata)
            }
          } else {
            context.result.data[0].metadata = []
          }
        } catch {
          context.result.data = []
        }
        return context
      }
    ],
    get: [
      (context: HookContext): HookContext => {
        try {
          if (context.result?.data[0]?.metadata) {
            for (let x = 0; x < context.result.data.length; x++) {
              context.result.data[x].metadata = JSON.parse(context.result.data[x].metadata)
            }
          } else {
            context.result.data[0].metadata = []
          }
        } catch {
          context.result.data = []
        }
        return context
      }
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
