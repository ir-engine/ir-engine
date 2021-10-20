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
    create: [notifications.addFollowCreator],
    update: [],
    patch: [],
    remove: [notifications.removeFollowCreator]
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
