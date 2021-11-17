import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import verifyScope from '../../hooks/verify-scope'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), verifyScope('editor', 'write')],
    update: [authenticate('jwt'), verifyScope('editor', 'write')],
    patch: [authenticate('jwt'), verifyScope('editor', 'write')],
    remove: [authenticate('jwt'), verifyScope('editor', 'write')]
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
