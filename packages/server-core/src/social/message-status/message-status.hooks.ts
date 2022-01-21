import authenticate from '../../hooks/authenticate'
import { disallow } from 'feathers-hooks-common'
// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [disallow('external')],
    update: [disallow()],
    patch: [disallow()],
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
