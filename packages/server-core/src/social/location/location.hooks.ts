import { iff, isProvider } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [authenticate()],
    find: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          },
          {
            model: 'location-settings'
          },
          {
            model: 'location-authorized-user'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          },
          {
            model: 'location-settings'
          },
          {
            model: 'location-authorized-user'
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), verifyScope('location', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('location', 'write') as any)],
    patch: [iff(isProvider('external'), verifyScope('location', 'write') as any)],
    remove: [iff(isProvider('external'), verifyScope('location', 'write') as any)]
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
