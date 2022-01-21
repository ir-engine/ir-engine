import authenticate from '../../hooks/authenticate'
import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import { HookContext } from '@feathersjs/feathers'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'
import { isProvider, iff } from 'feathers-hooks-common'

export default {
  before: {
    all: [authenticate()],
    find: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          },
          {
            model: 'location-settings'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'location-ban'
          },
          {
            model: 'location-settings'
          }
        ]
      })
    ],
    create: [iff(isProvider('external'), verifyScope('location', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('location', 'write') as any)],
    patch: [iff(isProvider('external'), verifyScope('location', 'write') as any)],
    remove: [
      iff(isProvider('external'), verifyScope('location', 'write') as any),
      async (context: HookContext): Promise<HookContext> => {
        const location = await (context.app.service('location') as any).Model.findOne({
          where: {
            isLobby: true,
            id: context.id
          },
          attributes: ['id', 'isLobby']
        })

        if (location) {
          throw new Error("Lobby can't be deleted")
        }

        return context
      }
    ]
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
