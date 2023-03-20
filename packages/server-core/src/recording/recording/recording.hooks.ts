import { iff, isProvider } from 'feathers-hooks-common'

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [iff(isProvider('external'), verifyScope('recording', 'read') as any)],
    get: [iff(isProvider('external'), verifyScope('recording', 'read') as any)],
    create: [
      iff(
        isProvider('external'),
        verifyScope('recording', 'write'),
        addAssociations({
          models: [
            {
              model: 'user',
              as: 'user'
            }
          ]
        }) as any
      )
    ],
    update: [iff(isProvider('external'), verifyScope('recording', 'write') as any)],
    patch: [iff(isProvider('external'), verifyScope('recording', 'write') as any)],
    remove: [iff(isProvider('external'), verifyScope('recording', 'write') as any)]
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
