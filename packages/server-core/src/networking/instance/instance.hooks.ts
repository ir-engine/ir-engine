import * as authentication from '@feathersjs/authentication'
import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import restrictUserRole from '../../hooks/restrict-user-role'
import { iff, isProvider } from 'feathers-hooks-common'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      addAssociations({
        models: [
          {
            model: 'gameserver-subdomain-provision'
          }
        ]
      })
    ],
    get: [],
    create: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    update: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    patch: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    remove: [iff(isProvider('external'), restrictUserRole('admin') as any)]
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
