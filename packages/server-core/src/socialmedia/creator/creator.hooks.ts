import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
const { authenticate } = authentication.hooks

// const check = async (context: HookContext): Promise<HookContext> => {
//   if (context.data.username) {
//     const creator = await (context.app.service('creator') as any).Model.findOne({
//       where: {
//         username: context.data.username
//       },
//       attributes: ['username']
//     })

//     if (creator) {
//       throw new Error('reject')
//     }
//   }

//   return context
// }

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
