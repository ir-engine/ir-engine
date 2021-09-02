import * as authentication from '@feathersjs/authentication'
import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import { HookContext } from '@feathersjs/feathers'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
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
    create: [],
    update: [],
    patch: [],
    remove: [
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
