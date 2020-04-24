import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'

// import attachOwnerIdInSavingContact from '../../hooks/set-loggedin-user-in-body'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [],
    update: [disallow()],
    patch: [],
    // TODO: Need to ask if we allow user to remove group or not
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
