import { disallow } from 'feathers-hooks-common'
import addUUID from '../../hooks/add-uuid'
import addUploadPath from '../../hooks/add-upload-path'

// Don't remove this comment. It's needed to format import lines nicely.

import createResource from '../../hooks/create-static-resource'

import addUriToFile from '../../hooks/add-uri-to-file'
import reformatUploadResult from '../../hooks/reformat-upload-result'
import makeS3FilesPublic from '../../hooks/make-s3-files-public'
import uploadThumbnail from '../../hooks/upload-thumbnail'

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [addUUID(), addUploadPath(), addUriToFile(), makeS3FilesPublic()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
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
}
