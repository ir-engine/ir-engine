import { disallow } from 'feathers-hooks-common'

/**
 * @author Abhishek Pathak
 */

export default {
  before: {
    all: [],
    find: [disallow('external')],
    get: [],
    create: [],
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
