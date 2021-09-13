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
      }),
      async (context: HookContext) => {
        const userId = context.params['identity-provider']?.userId
        const scope = await context.app.service('scope').Model.findOne({
          where: {
            userId
          },
          raw: true,
          nest: true
        })
        // if(scope){
        //   throw new Error("scope is not defined")
        // }
        console.log(scope)
        return context
      }
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
