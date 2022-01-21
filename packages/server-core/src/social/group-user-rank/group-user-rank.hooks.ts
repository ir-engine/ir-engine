import authenticate from '../../hooks/authenticate'
import { disallow } from 'feathers-hooks-common'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [disallow()],
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
} as any
