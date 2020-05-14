import * as authentication from '@feathersjs/authentication'
import attachOwnerIdInQuery from '../../hooks/set-loggedin-user-in-query'
import addAssociations from '../../hooks/add-associations'
import collectAnalytics from '../../hooks/collect-analytics'

const { authenticate } = authentication.hooks

export default {
  before: {
    all: [collectAnalytics(), authenticate('jwt')],
    find: [
      attachOwnerIdInQuery('userId'),
      addAssociations({
        models: [
          {
            model: 'entity',
            include: [
              {
                model: 'component'
              }
            ]
          }
        ]
      })
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
}
