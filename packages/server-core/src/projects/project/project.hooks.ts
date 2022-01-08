import * as authentication from '@feathersjs/authentication'
import * as commonHooks from 'feathers-hooks-common'

import verifyScope from '../../hooks/verify-scope'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      authenticate('jwt'),
      commonHooks.iff(commonHooks.isProvider('external'), verifyScope('editor', 'write') as any)
    ],
    update: [
      authenticate('jwt'),
      commonHooks.iff(commonHooks.isProvider('external'), verifyScope('editor', 'write') as any)
    ],
    patch: [
      authenticate('jwt'),
      commonHooks.iff(commonHooks.isProvider('external'), verifyScope('editor', 'write') as any)
    ],
    remove: [
      authenticate('jwt'),
      commonHooks.iff(commonHooks.isProvider('external'), verifyScope('editor', 'write') as any)
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
} as any
