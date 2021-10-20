import { disallow } from 'feathers-hooks-common'
import addUUID from '@standardcreative/server-core/src/hooks/add-uuid'
import addUploadPath from '@standardcreative/server-core/src/hooks/add-upload-path'
import * as authentication from '@feathersjs/authentication'

import addUriToFile from '@standardcreative/server-core/src/hooks/add-uri-to-file'
import reformatUploadResult from '@standardcreative/server-core/src/hooks/reformat-upload-result'
import makeS3FilesPublic from '@standardcreative/server-core/src/hooks/make-s3-files-public'
import uploadThumbnail from '@standardcreative/server-core/src/hooks/upload-thumbnail'
import setLoggedInUser from '@standardcreative/server-core/src/hooks/set-loggedin-user-in-body'
import createResource from '@standardcreative/server-core/src/hooks/create-static-resource'
import { validateGet, checkDefaultResources } from '@standardcreative/server-core/src/hooks/validatePresignedRequest'
import * as commonHooks from 'feathers-hooks-common'

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
    remove: [authenticate('jwt'), checkDefaultResources]
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
