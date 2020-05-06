import * as feathersAuthentication from '@feathersjs/authentication'
import * as local from '@feathersjs/authentication-local'
import * as commonHooks from 'feathers-hooks-common'
import accountService from '../auth-management/auth-management.notifier'
import { HookContext } from '@feathersjs/feathers'

const verifyHooks = require('feathers-authentication-management').hooks
const { authenticate } = feathersAuthentication.hooks
const { protect } = local.hooks

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
    if (context.result?.type === 'password') {
      accountService(context.app).notifier('resendVerifySignup', context.result)
    }
    return context
  }
}

export default {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [authenticate('jwt')],
    create: [
    //  hashPassword('password'),
      commonHooks.iff(
        isPasswordAccountType(),
        verifyHooks.addVerification()
      )
    ],
    update: [authenticate('jwt')], // hashPassword('password'), authenticate('jwt')
    patch: [authenticate('jwt')], // hashPassword('password'), authenticate('jwt')
    remove: [authenticate('jwt')] // authenticate('jwt')
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
      commonHooks.iff(
        commonHooks.isProvider('external'),
        commonHooks.preventChanges(
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
