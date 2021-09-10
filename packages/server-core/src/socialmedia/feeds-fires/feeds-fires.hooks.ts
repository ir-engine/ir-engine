/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
import * as notifications from '@xrengine/server-core/src/hooks/notifications'

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [notifications.addFeedFire],
    update: [],
    patch: [],
    remove: [notifications.removeFeedFire]
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
