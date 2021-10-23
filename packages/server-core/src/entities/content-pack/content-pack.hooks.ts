import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'
import logRequest from '../../hooks/log-request'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [authenticate('jwt'), verifyScope('contentPacks', 'write')],
    update: [authenticate('jwt')],
    patch: [authenticate('jwt'), verifyScope('contentPacks', 'write')],
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
