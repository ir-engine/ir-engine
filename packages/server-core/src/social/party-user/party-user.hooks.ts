import { HookOptions } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import isInternalRequest from '../../hooks/isInternalRequest'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate(), isInternalRequest()],
    find: [],
    get: [],
    create: [iff(isProvider('external'), disallow())],
    update: [disallow()],
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
    update: [disallow()],
    patch: [],
    remove: []
  }
} as HookOptions<any, any>
