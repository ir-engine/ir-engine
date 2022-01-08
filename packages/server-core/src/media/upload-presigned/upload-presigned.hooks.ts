import * as authentication from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'

import createResource from '@xrengine/server-core/src/hooks/create-static-resource'
import reformatUploadResult from '@xrengine/server-core/src/hooks/reformat-upload-result'
import uploadThumbnail from '@xrengine/server-core/src/hooks/upload-thumbnail'
import { checkDefaultResources, validateGet } from '@xrengine/server-core/src/hooks/validatePresignedRequest'

import restrictUserRole from '../../hooks/restrict-user-role'

// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [authenticate('jwt'), validateGet],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [authenticate('jwt'), restrictUserRole('admin'), checkDefaultResources]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [reformatUploadResult(), createResource(), uploadThumbnail()],
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
