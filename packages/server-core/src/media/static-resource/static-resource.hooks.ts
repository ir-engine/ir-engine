import { disallow, iff, isProvider } from 'feathers-hooks-common'

import collectAnalytics from '@xrengine/server-core/src/hooks/collect-analytics'
import replaceThumbnailLink from '@xrengine/server-core/src/hooks/replace-thumbnail-link'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'

export default {
  before: {
    all: [],
    find: [collectAnalytics()],
    get: [disallow('external')],
    create: [authenticate(), restrictUserRole('admin')],
    update: [authenticate(), restrictUserRole('admin')],
    patch: [authenticate(), restrictUserRole('admin'), replaceThumbnailLink()],
    remove: [
      authenticate(),
      iff(isProvider('external'), restrictUserRole('admin') as any),
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
