import addAssociations from '@etherealengine/server-core/src/hooks/add-associations'
import channelPermissionAuthenticate from '@etherealengine/server-core/src/hooks/channel-permission-authenticate'
import messagePermissionAuthenticate from '@etherealengine/server-core/src/hooks/message-permission-authenticate'
import removeMessageStatuses from '@etherealengine/server-core/src/hooks/remove-message-statuses'

import authenticate from '../../hooks/authenticate'

// Don't remove this comment. It's needed to format import lines nicely.

export default {
  before: {
    all: [authenticate()],
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
