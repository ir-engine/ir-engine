import collectAnalytics from '../../hooks/collect-analytics'
import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import generateInvitePasscode from '../../hooks/generate-invite-passcode'
import sendInvite from '../../hooks/send-invite'
import attachOwnerIdInBody from '../../hooks/set-loggedin-user-in-body'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [collectAnalytics()],
    find: [authenticate('jwt')],
    get: [],
    create: [
        authenticate('jwt'),
        attachOwnerIdInBody('userId'),
        generateInvitePasscode()
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      sendInvite()
    ],
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
};