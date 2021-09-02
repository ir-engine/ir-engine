/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
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
    create: [notifications.addFeedCommentFire],
    update: [],
    patch: [],
    remove: [notifications.removeFeedCommentFire]
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
