import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import { UserDataType } from '../../user/user/user.class'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [
      async (context): Promise<HookContext> => {
        const { app, data, params } = context
        const loggedInUser = params.user as UserDataType
        return context
      }
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: []
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
