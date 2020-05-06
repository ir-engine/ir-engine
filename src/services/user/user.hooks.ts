import * as authentication from '@feathersjs/authentication'
import addAssociations from '../../hooks/add-associations'

const { authenticate } = authentication.hooks

// const addAssociation = () => {
//   return (context: any) => {
//     const IdentityProvider = context.app.service('identity-provider').Model
//     const sequelize = context.params.sequelize || {}
//     sequelize.raw = false
//     sequelize.include = [
//       {
//         model: IdentityProvider
//       }
//     ]
//     context.params.sequelize = sequelize
//     return context
//   }
// }

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [
      addAssociations({
        models: [
          {
            model: 'identity-provider'
          }
        ]
      })
    ],
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
