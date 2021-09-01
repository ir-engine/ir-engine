import * as authentication from '@feathersjs/authentication'
import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'
import * as commonHooks from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt'), commonHooks.iff(commonHooks.isProvider('external'), restrictUserRole('admin'))],
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
