import { disallow, iff, isProvider } from 'feathers-hooks-common'

import collectAnalytics from '@etherealengine/server-core/src/hooks/collect-analytics'

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [collectAnalytics()],
    get: [
      disallow('external'),
      addAssociations({
        models: [
          {
            model: 'static-resource',
            as: 'glbStaticResource'
          },
          {
            model: 'static-resource',
            as: 'gltfStaticResource'
          },
          {
            model: 'static-resource',
            as: 'fbxStaticResource'
          },
          {
            model: 'static-resource',
            as: 'usdzStaticResource'
          },
          {
            model: 'image',
            as: 'thumbnail'
          }
        ]
      })
    ],
    create: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    update: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    patch: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)],
    remove: [authenticate(), iff(isProvider('external'), verifyScope('admin', 'admin') as any)]
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
