/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import * as notifications from '@standardcreative/server-core/src/hooks/notifications'

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
    create: [notifications.addFeedBookmark],
    update: [],
    patch: [],
    remove: [notifications.removeFeedBookmark]
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
