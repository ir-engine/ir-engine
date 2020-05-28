import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const validateFriendRequest = () => {
  return (context: HookContext) => {
    const requiredData = ['conversationId', 'userId', 'action']
    const data = context.data
    requiredData.forEach((item: any) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!data.hasOwnProperty(item)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Missing property in data: ${item}`)
      }
    })
    return context
  }
}

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [validateFriendRequest()],
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
}
