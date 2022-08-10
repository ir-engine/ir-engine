import { HookOptions } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import addAssociations from '../../hooks/add-associations'
import authenticate from '../../hooks/authenticate'
import isInternalRequest from '../../hooks/isInternalRequest'
import partyPermissionAuthenticate from '../../hooks/party-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate(), isInternalRequest()],
    find: [
      iff(isProvider('external'), verifyScope('admin', 'admin') as any),
      addAssociations({
        models: [
          {
            model: 'party-user',
            include: [
              {
                model: 'user'
              }
            ]
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'party-user',
            include: [
              {
                model: 'user'
              }
            ]
          }
        ]
      })
    ],
    create: [],
    update: [disallow()],
    patch: [iff(isProvider('external'), partyPermissionAuthenticate() as any)],
    remove: [iff(isProvider('external'), partyPermissionAuthenticate() as any)]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      /*createPartyInstance()*/
    ],
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
} as HookOptions<any, any>
