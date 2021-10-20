import * as authentication from '@feathersjs/authentication'
import messagePermissionAuthenticate from '@standardcreative/server-core/src/hooks/message-permission-authenticate'
import removeMessageStatuses from '@standardcreative/server-core/src/hooks/remove-message-statuses'
import channelPermissionAuthenticate from '@standardcreative/server-core/src/hooks/channel-permission-authenticate'
import addAssociations from '@standardcreative/server-core/src/hooks/add-associations'
// import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [
      channelPermissionAuthenticate(),
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'sender'
          }
        ]
      })
    ],
    get: [
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'sender'
          }
        ]
      })
    ],
    create: [],
    update: [
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'sender'
          }
        ]
      })
    ],
    patch: [
      messagePermissionAuthenticate(),
      addAssociations({
        models: [
          {
            model: 'user',
            as: 'sender'
          }
        ]
      })
    ],
    remove: [messagePermissionAuthenticate()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [removeMessageStatuses()]
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
