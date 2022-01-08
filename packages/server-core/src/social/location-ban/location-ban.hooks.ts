import * as authentication from '@feathersjs/authentication'
import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'

import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      async (context): Promise<HookContext> => {
        const { app, data } = context
        const loggedInUser = extractLoggedInUserFromParams(context.params)
        const locationAdmins = await app.service('location-admin').find({
          query: {
            locationId: data.locationId,
            userId: loggedInUser.userId
          }
        })
        if (locationAdmins.total === 0) {
          throw new Forbidden('Not an admin of that location')
        }
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
