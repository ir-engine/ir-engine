import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

/**
 *  Don't remove this comment. It's needed to format import lines nicely.
 *
 */

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      addAssociations({
        models: [
          {
            model: 'message',
            include: [
              {
                model: 'user',
                as: 'sender'
              }
            ]
          },
          {
            model: 'instance'
          },
          {
            model: 'group'
          },
          {
            model: 'party'
          },
          {
            model: 'user',
            as: 'user1'
          },
          {
            model: 'user',
            as: 'user2'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'message',
            include: [
              {
                model: 'user',
                as: 'sender'
              }
            ]
          },
          {
            model: 'instance'
          },
          {
            model: 'group'
          },
          {
            model: 'party'
          },
          {
            model: 'user',
            as: 'user1'
          },
          {
            model: 'user',
            as: 'user2'
          }
        ]
      })
    ],
    create: [disallow('external')],
    update: [disallow('external')],
    patch: [disallow('external')],
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
