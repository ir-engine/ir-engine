import collectAnalytics from '../../hooks/collect-analytics'
import * as authentication from '@feathersjs/authentication'
import createGroupFirstUser from '../../hooks/create-group-first-user'
const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
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
    create: [createGroupFirstUser()],
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
