import { HookContext } from '@feathersjs/feathers'
import { hooks } from '@feathersjs/authentication'
import dauria from 'dauria'
import removeOwnedFile from '@xrengine/server-core/src/hooks/remove-owned-file'
import replaceThumbnailLink from '@xrengine/server-core/src/hooks/replace-thumbnail-link'
import attachOwnerIdInQuery from '@xrengine/server-core/src/hooks/set-loggedin-user-in-query'
import verifyScope from '@xrengine/server-core/src/hooks/verify-scope'

const { authenticate } = hooks

export default {
  before: {
    all: [],
    find: [verifyScope('static_resource', 'read'), collectAnalytics()],
    get: [verifyScope('statisc_resource', 'read')],
    create: [
      verifyScope('static_resource', 'write'),
      authenticate('jwt'),
      (context: HookContext): HookContext => {
        if (!context.data.uri && context.params.file) {
          const file = context.params.file
          const uri = dauria.getBase64DataURI(file.buffer, file.mimetype)
          console.log('uri is', uri)
          const url = dauria.getBase64DataURI(file.buffer, file.mimetype)
          const mimeType = context.data.mimeType ?? file.mimetype
          console.log('mimeType is', file.mimetype)
          const name = context.data.name ?? file.name
          context.data = { uri: uri, mimeType: mimeType, name: name }
        }
        return context
      }
    ],
    update: [verifyScope('static_resource', 'write'), authenticate('jwt')],
    patch: [verifyScope('static_resource', 'write'), authenticate('jwt'), replaceThumbnailLink()],
    remove: [
      verifyScope('static_resource', 'write'),
      authenticate('jwt'),
      attachOwnerIdInQuery('userId'),
      removeOwnedFile()
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
