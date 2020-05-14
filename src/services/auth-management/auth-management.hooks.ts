import { hooks } from '@feathersjs/authentication'
import { iff } from 'feathers-hooks-common'

const { authenticate } = hooks

const isAction = (...params: any): any => {
  const args = Array.from(params)
  return (hook: any) => args.includes(hook.data.action)
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(
        isAction('passwordChange', 'identityChange'),
        authenticate('jwt')
      )
    ],
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
}
