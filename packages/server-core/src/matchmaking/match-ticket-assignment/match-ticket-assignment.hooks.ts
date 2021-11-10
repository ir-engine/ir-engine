import * as commonHooks from 'feathers-hooks-common'
import createLocationIfNotExists from '@xrengine/server-core/src/hooks/matchmaking-create-location-if-not-exists'
import saveConnection from '@xrengine/server-core/src/hooks/matchmaking-save-connection'
// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [commonHooks.disallow()],
    update: [commonHooks.disallow()],
    patch: [commonHooks.disallow()],
    remove: [commonHooks.disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [saveConnection(), createLocationIfNotExists()], // createLocationIfNotExists - is side effect...
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
