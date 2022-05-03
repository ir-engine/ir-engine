import { HookContext } from '@feathersjs/feathers'
import dauria from 'dauria'
import { iff, isProvider } from 'feathers-hooks-common'

import collectAnalytics from '@xrengine/server-core/src/hooks/collect-analytics'
import replaceThumbnailLink from '@xrengine/server-core/src/hooks/replace-thumbnail-link'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'

import authenticate from '../../hooks/authenticate'
import restrictUserRole from '../../hooks/restrict-user-role'
import logger from '../../logger'

export default {
  before: {
    all: [],
    find: [collectAnalytics()],
    get: [],
    create: [
      authenticate(),
      restrictUserRole('admin'),
      (context: HookContext): HookContext => {
        if (!context.data.uri && context.params.file) {
          const file = context.params.file
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype)
          logger.info(`uri is: ${uri}`)
          const url = dauria.getBase64DataURI(file.buffer, file.mimetype)
          const mimeType = context.data.mimeType ?? file.mimetype
          logger.info(`mimeType is: ${file.mimetype}`)
          const name = context.data.name ?? file.name
          context.data = { uri: uri, mimeType: mimeType, name: name }
        }
        return context
      }
    ],
    update: [authenticate(), restrictUserRole('admin')],
    patch: [authenticate(), restrictUserRole('admin'), replaceThumbnailLink()],
    remove: [
      authenticate(),
      iff(isProvider('external'), restrictUserRole('admin') as any),
      attachOwnerIdInQuery('userId')
    ]
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
