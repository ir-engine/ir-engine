import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import logRequest from '../../hooks/log-request'
import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [authenticate('jwt'), restrictUserRole('admin')],
    update: [authenticate('jwt')],
    patch: [authenticate('jwt'), restrictUserRole('admin')],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      /*reformatUploadResult(), addThumbnailFileId(), removePreviousThumbnail(), createOwnedFile(), setResponseStatus(200)*/
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [logRequest()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
