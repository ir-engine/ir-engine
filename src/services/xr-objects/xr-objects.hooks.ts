import * as authentication from '@feathersjs/authentication'
import limitUserId from '../../hooks/limit-user-id';
import setUserId from '../../hooks/set-user-id';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [
        authenticate('jwt'),
    ],
    find: [limitUserId],
    get: [limitUserId],
    create: [setUserId],
    update: [limitUserId],
    patch: [limitUserId],
    remove: [limitUserId]
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
}
