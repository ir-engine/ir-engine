import { iff, isProvider } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [
      addAssociations({
        models: [
          {
            model: 'instanceserver-subdomain-provision'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'instanceserver-subdomain-provision'
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    update: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    patch: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin') as any)]
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
