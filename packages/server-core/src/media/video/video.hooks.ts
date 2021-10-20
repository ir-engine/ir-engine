import { hooks } from '@feathersjs/authentication'
import { iff, disallow } from 'feathers-hooks-common'
import restrictUserRole from '@standardcreative/server-core/src/hooks/restrict-user-role'
import addUserToBody from '@standardcreative/server-core/src/hooks/set-loggedin-user-in-body'
import config from '../../appconfig'

const { authenticate } = hooks

export default {
  before: {
    all: [
      iff(config.server.mode !== 'media' && config.server.mode !== 'local', disallow('external')),
      authenticate('jwt'),
      restrictUserRole('admin')
    ],
    find: [disallow()],
    get: [disallow()],
    create: [addUserToBody('userId')],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
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
