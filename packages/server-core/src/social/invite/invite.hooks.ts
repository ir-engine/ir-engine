import { disallow } from 'feathers-hooks-common'
import { iff, isProvider } from 'feathers-hooks-common'

import inviteRemoveAuthenticate from '@xrengine/server-core/src/hooks/invite-remove-authenticate'
import attachOwnerIdInBody from '@xrengine/server-core/src/hooks/set-loggedin-user-in-body'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'
import addAssociations from "../../hooks/add-associations";

export default {
  before: {
    all: [],
    find: [
      authenticate(),
      attachOwnerIdInQuery('userId'),
      addAssociations({
        models: [{
          model: 'user'
        }]
      })
    ],
    get: [iff(isProvider('external'), authenticate() as any, attachOwnerIdInQuery('userId') as any),
      addAssociations({
        models: [{
          model: 'user'
        }]
      })],
    create: [authenticate(), attachOwnerIdInBody('userId')],
    update: [iff(isProvider('external'), authenticate() as any, restrictUserRole('admin') as any)],
    patch: [iff(isProvider('external'), authenticate() as any, restrictUserRole('admin') as any)],
    remove: [authenticate(), inviteRemoveAuthenticate()]
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
