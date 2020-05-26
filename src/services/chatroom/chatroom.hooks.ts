import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import addOnlineUsers from '../../hooks/add-online-users'
import addGroups from '../../hooks/add-groups'
import addParty from '../../hooks/add-party'
import updateMessageDelivery from '../../hooks/update-message-delivery'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [disallow()],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [addOnlineUsers(), addGroups(), addParty(), updateMessageDelivery()],
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
