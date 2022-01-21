import authenticate from '../../hooks/authenticate'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'
import { iff, isProvider, disallow } from 'feathers-hooks-common'

/**
 * This module used to declare and identify database relation
 * which will be used later in user service
 */

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    get: [iff(isProvider('external'), attachOwnerIdInQuery('userId') as any)],
    create: [disallow('external')],
    update: [disallow('external')],
    patch: [],
    remove: [disallow('external')]
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
} as any
