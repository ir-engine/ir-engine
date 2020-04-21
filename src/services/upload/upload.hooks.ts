import { disallow } from 'feathers-hooks-common'

// Don't remove this comment. It's needed to format import lines nicely.

import createResource from '../../hooks/create-resource'

import addUriToFile from '../../hooks/add-uri-to-file'

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [],
    create: [addUriToFile()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [addUriToFile(), createResource()],
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
