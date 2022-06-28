import { disallow } from 'feathers-hooks-common'

import addAssociations from '@xrengine/server-core/src/hooks/add-associations'

import authenticate from '../../hooks/authenticate'

/**
 *  Don't remove this comment. It's needed to format import lines nicely.
 *
 */

export default {
  before: {
    all: [authenticate()],
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
      disallow('external'),
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
    remove: [disallow('external')]
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
