import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import collectAnalytics from '../../hooks/collect-analytics'
import { HookContext } from '@feathersjs/feathers'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

const validateCreatePartyUser = () => {
  return (context: HookContext) => {
    const requiredData = ['userId', 'partyId']
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

const validateUpdatePartyUser = () => {
  return (context: HookContext) => {
    const requiredData = ['userId', 'action']
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
    all: [authenticate('jwt'), collectAnalytics()],
    find: [],
    get: [],
    create: [validateCreatePartyUser()],
    update: [validateUpdatePartyUser()],
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
    update: [disallow()],
    patch: [],
    remove: []
  }
}
