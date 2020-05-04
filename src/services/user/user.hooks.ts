import * as feathersAuthentication from '@feathersjs/authentication'
// import * as local from '@feathersjs/authentication-local'
import * as commonHooks from 'feathers-hooks-common'
import accountService from '../auth-management/auth-management.notifier'
// Don't remove this comment. It's needed to format import lines nicely.

// const verifyHooks = require('feathers-authentication-management').hooks
const { authenticate } = feathersAuthentication.hooks
// const { hashPassword, protect } = local.hooks

const addAssociation = () => {
  return (context: any) => {
    const IdentityProvider = context.app.service('identity-provider').Model
    const sequelize = context.params.sequelize || {};
    sequelize.raw = false;
    sequelize.include = [
      {
        model: IdentityProvider
      }
    ]
    context.params.sequelize = sequelize
    return context
  }
}

export default {
  before: {
    all: [],
    find: [], // authenticate('jwt')
    get: [
      // authenticate('jwt'),
      addAssociation()
    ], // authenticate('jwt')
    create: [
    //  hashPassword('password'),
    //  verifyHooks.addVerification()
    ],
    update: [], // hashPassword('password'), authenticate('jwt')
    patch: [], // hashPassword('password'), authenticate('jwt')
    remove: [] // authenticate('jwt')
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      // protect('password')
    ],
    find: [],
    get: [],
    create: [
      (context: any) => {
        // This will keep emails from blasting out to fake users while you develop
        return (process.env.DEV) ? context.result : accountService(context.app).notifier('resendVerifySignup', context.result)
      }
    ],
    update: [],
    patch: [
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(
          true //,
        //  'email',
        //  'isVerified',
        //  'verifyToken',
        //  'verifyShortToken',
        //  'verifyExpires',
        //  'verifyChanges',
        //  'resetToken',
        //  'resetShortToken',
        //  'resetExpires'
        ))
    ],
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
