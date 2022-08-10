import { disallow, iff, isProvider } from 'feathers-hooks-common'

import collectAnalytics from '@xrengine/server-core/src/hooks/collect-analytics'
import replaceThumbnailLink from '@xrengine/server-core/src/hooks/replace-thumbnail-link'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [collectAnalytics()],
    get: [disallow('external')],
    create: [authenticate(), verifyScope('admin', 'admin')],
    update: [authenticate(), verifyScope('admin', 'admin')],
    patch: [authenticate(), verifyScope('admin', 'admin'), replaceThumbnailLink()],
    remove: [
      authenticate(),
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
      attachOwnerIdInQuery('userId')
    ]
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
