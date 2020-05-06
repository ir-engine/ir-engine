import * as authentication from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
import { disallow } from 'feathers-hooks-common'
import { BadRequest } from '@feathersjs/errors'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

// For now only Party Owner will be able to remove user
const removeUserFromGroupQuery = () => {
  return (context: HookContext) => {
    Object.assign(context.params.query, {
      isOwner: true,
      userId: context.params.user.userId
    })
    return context
  }
}

const validateGroupId = () => {
  return async (context: HookContext) => {
    if (!context?.params?.query?.partyId) {
      return await Promise.reject(new BadRequest('Party Id is required!'))
    }
    return context
  }
}

export default {
  before: {
    all: [
      authenticate('jwt'),
      validateGroupId()
    ],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [],
    remove: [
      // For now only admin will be able to remove the user from party!
      removeUserFromGroupQuery()
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
    update: [disallow()],
    patch: [],
    remove: []
  }
}
