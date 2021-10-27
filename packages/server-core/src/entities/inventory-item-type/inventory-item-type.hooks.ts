import { disallow } from 'feathers-hooks-common'
import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

export default {
  before: {
    all: [],
    find: [addAssociations({
      models: [
        {
          model: 'inventory-item',
        }
      ]
    })],
    get: [addAssociations({
      models: [
        {
          model: 'inventory-item',
        }
      ]
    })],
    create: [],
    update: [disallow()],
    patch: [disallow()],
    remove: []
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
