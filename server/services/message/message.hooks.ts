import * as authentication from '@feathersjs/authentication'
import messagePermissionAuthenticate from '../../hooks/message-permission-authenticate'
import removeMessageStatuses from '../../hooks/remove-message-statuses'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [messagePermissionAuthenticate()],
    remove: [messagePermissionAuthenticate()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [removeMessageStatuses()]
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
}
