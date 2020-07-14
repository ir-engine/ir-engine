import collectAnalytics from '../../hooks/collect-analytics'
import groupPermissionAuthenticate from '../../hooks/group-permission-authenticate'
import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [disallow('external')],
    update: [],
    patch: [],
    remove: [
      groupPermissionAuthenticate()
    ]
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
