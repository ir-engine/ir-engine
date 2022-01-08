import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

export default {
  before: {
    all: [],
    find: [
      addAssociations({
        models: [
          {
            model: 'inventory-item'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'inventory-item'
          }
        ]
      })
    ],
    create: [],
    update: [disallow()],
    patch: [disallow()],
    remove: []
  },

  after: {
    all: [],
    find: [
      (context: HookContext): HookContext => {
        try {
          if (context.result?.data[0]) {
            for (let x = 0; x < context.result.data.length; x++) {
              //context.result.data[x].inventory_items.metadata = JSON.parse(context.result.data[x].inventory_items.metadata)
              for (let i = 0; i < context.result.data[x].inventory_items.length; i++) {
                context.result.data[x].inventory_items[i].metadata = JSON.parse(
                  context.result.data[x].inventory_items[i].metadata
                )
              }
            }
          } else {
            context.result.data = []
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
          if (context.result?.data[0]) {
            for (let x = 0; x < context.result.data.length; x++) {
              //context.result.data[x].inventory_items.metadata = JSON.parse(context.result.data[x].inventory_items.metadata)
              for (let i = 0; i < context.result.data[x].inventory_items.length; i++) {
                context.result.data[x].inventory_items[i].metadata = JSON.parse(
                  context.result.data[x].inventory_items[i].metadata
                )
              }
            }
          } else {
            context.result.data = []
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
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
