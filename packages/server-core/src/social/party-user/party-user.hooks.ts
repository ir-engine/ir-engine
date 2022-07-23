import { HookOptions } from '@feathersjs/feathers'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import isInternalRequest from '../../hooks/isInternalRequest'
import restrictUserRole from "../../hooks/restrict-user-role";
import partyUserPermissionAuthenticate from "../../hooks/party-user-permission-authenticate";

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate(), isInternalRequest()],
    find: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    get: [iff(isProvider('external'), restrictUserRole('admin') as any)],
    create: [iff(isProvider('external'), disallow())],
    update: [disallow()],
    patch: [iff(isProvider('external'), partyUserPermissionAuthenticate() as any)],
    remove: [iff(isProvider('external'), partyUserPermissionAuthenticate() as any)]
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
    update: [disallow()],
    patch: [],
    remove: []
  }
} as HookOptions<any, any>
