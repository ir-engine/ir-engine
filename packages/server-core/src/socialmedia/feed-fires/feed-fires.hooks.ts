/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import * as notifications from '../../hooks/notifications'

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
