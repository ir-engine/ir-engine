import * as authentication from '@feathersjs/authentication'
import verifyScope from '../../hooks/verify-scope'
import { iff, isProvider } from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    update: [authenticate('jwt'), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    patch: [authenticate('jwt'), iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    remove: [authenticate('jwt'), iff(isProvider('external'), verifyScope('editor', 'write') as any)]
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
