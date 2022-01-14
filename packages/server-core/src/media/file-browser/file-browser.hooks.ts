import { disallow, iff, isProvider } from 'feathers-hooks-common'
import verifyScope from '../../hooks/verify-scope'

/**
 * @author Abhishek Pathak
 */

export default {
  before: {
    all: [],
    find: [disallow('external')],
    get: [],
    create: [iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    patch: [iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    remove: [iff(isProvider('external'), verifyScope('editor', 'write') as any)]
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
