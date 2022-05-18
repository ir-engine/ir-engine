import { iff, isProvider } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'

export default {
  before: {
    all: [authenticate()],
    find: [
      addAssociations({
        models: [
          {
            model: 'gameserver-subdomain-provision'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'gameserver-subdomain-provision'
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [iff(isProvider('external'), restrictUserRole('admin') as any)]
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
