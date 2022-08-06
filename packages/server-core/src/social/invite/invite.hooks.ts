import { disallow } from 'feathers-hooks-common'
import { iff, isProvider } from 'feathers-hooks-common'

import inviteRemoveAuthenticate from '@xrengine/server-core/src/hooks/invite-remove-authenticate'
import attachOwnerIdInBody from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [],
    find: [
      authenticate(),
      attachOwnerIdInQuery('userId'),
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'user'
          }
        ]
      })
    ],
    get: [
      iff(isProvider('external'), authenticate() as any, attachOwnerIdInQuery('userId') as any),
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'user'
          }
        ]
      })
    ],
    create: [authenticate(), attachOwnerIdInBody('userId')],
    update: [iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin') as any)],
    patch: [iff(isProvider('external'), authenticate() as any, verifyScope('admin', 'admin') as any)],
    remove: [authenticate(), iff(isProvider('external'), inviteRemoveAuthenticate() as any)]
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
