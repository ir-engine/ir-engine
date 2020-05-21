import * as feathersAuthentication from '@feathersjs/authentication'
import { hooks } from '@feathersjs/authentication-local'
import { iff, isProvider, preventChanges, disallow } from 'feathers-hooks-common'
import { HookContext } from '@feathersjs/feathers'
import accountService from '../auth-management/auth-management.notifier'
import isIdentityProviderEmpty from '../../hooks/is-identity-provider-empty'
import removeUserAccount from '../../hooks/remove-user-account'

const verifyHooks = require('feathers-authentication-management').hooks
const { authenticate } = feathersAuthentication.hooks
const { protect, hashPassword } = hooks

const isPasswordAccountType = () => {
  return (context: HookContext): boolean => {
    if (context.data.type === 'password') {
      return true
    }
    return false
  }
}

const sendVerifyEmail = () => {
  return (context: any) => {
    accountService(context.app).notifier('resendVerifySignup', context.result)
    return context
  }
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      iff(
        isPasswordAccountType(),
        hashPassword('password'),
        verifyHooks.addVerification()
      )
    ],
    update: [
      iff(
        isPasswordAccountType(),
        hashPassword('password')
      ),
      authenticate('jwt')
    ],
    patch: [disallow()],
    remove: [
      authenticate('jwt')
    ]
  },

  after: {
    all: [
      protect('password')
    ],
    find: [],
    get: [],
    create: [
      sendVerifyEmail()
    ],
    update: [],
    patch: [
      iff(
        isProvider('external'),
        preventChanges(
          true,
          'isVerified',
          'verifyToken',
          'verifyShortToken',
          'verifyExpires',
          'verifyChanges',
          'resetToken',
          'resetShortToken',
          'resetExpires'
        ))
    ],
    remove: [
      iff(
        isIdentityProviderEmpty(),
        removeUserAccount()
      )
    ]
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
