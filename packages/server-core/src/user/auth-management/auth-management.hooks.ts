import { disallow, iff } from 'feathers-hooks-common'

import isAction from '@xrengine/server-core/src/hooks/is-action'

import authenticate from '../../hooks/authenticate'

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [iff(isAction('passwordChange', 'identityChange'), authenticate() as any)],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
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
