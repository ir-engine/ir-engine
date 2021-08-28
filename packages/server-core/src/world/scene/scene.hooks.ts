import getScene from '@xrengine/server-core/src/hooks/get-scene'
import collectAnalytics from '@xrengine/server-core/src/hooks/collect-analytics'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'
// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [collectAnalytics()],
    find: [verifyScope('scene', 'read')],
    get: [verifyScope('scene', 'read')],
    create: [verifyScope('scene', 'write')],
    update: [verifyScope('scene', 'write')],
    patch: [verifyScope('scene', 'write')],
    remove: [verifyScope('scene', 'write')]
  },

  after: {
    all: [],
    find: [],
    get: [getScene()],
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
