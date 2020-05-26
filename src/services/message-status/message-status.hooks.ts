import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import updateMessageStatus from '../../hooks/update-message-status'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [disallow('external')],
    get: [disallow('external')],
    create: [disallow('external')],
    update: [],
    patch: [disallow('external')],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [updateMessageStatus()],
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
}
