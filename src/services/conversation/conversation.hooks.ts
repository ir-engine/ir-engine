import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
import formatConversation from '../../hooks/format-conversation'
import { Op } from 'sequelize'
import { BadRequest } from '@feathersjs/errors'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const validateFriendRequestAction = () => {
  return (context: HookContext) => {
    const requiredData = ['conversationId', 'userId', 'action']
    const data = context.data
    requiredData.forEach((item: any) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!data.hasOwnProperty(item)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new BadRequest(`Missing property in data: ${item}`)
      }
    })
    return context
  }
}

const validateFriendRequest = () => {
  return async (context: HookContext) => {
    const requiredData = ['firstuserId', 'seconduserId']
    const { data, app } = context
    requiredData.forEach((item: any) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!data.hasOwnProperty(item)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new BadRequest(`Missing property in data: ${item}`)
      }
    })
    const conversation = await app.service('conversation').Model.findOne(
      {
        where: {
          [Op.or]: [
            {
              [Op.or]: [{ firstuserId: data.firstuserId }, { seconduserId: data.seconduserId }]
            },
            {
              [Op.or]: [{ firstuserId: data.seconduserId }, { seconduserId: data.firstuserId }]
            }
          ]
        }
      }
    )
    if (conversation) {
      throw new BadRequest('Already created conversation')
    }
    return context
  }
}

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [validateFriendRequest()],
    update: [validateFriendRequestAction()],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [formatConversation()],
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
