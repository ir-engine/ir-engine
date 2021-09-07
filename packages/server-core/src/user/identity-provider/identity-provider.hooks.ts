import * as feathersAuthentication from '@feathersjs/authentication'
import { hooks } from '@feathersjs/authentication-local'
import accountService from '../auth-management/auth-management.notifier'
import { HookContext } from '@feathersjs/feathers'

const { authenticate } = feathersAuthentication.hooks
const hashPassword = hooks.hashPassword

const { protect } = hooks

const isPasswordAccountType = () => {
  return (context: HookContext): boolean => {
    if (context.data.type === 'password') {
      return true
    }
    return false
  }
}

const sendVerifyEmail = () => {
  return (context: any): Promise<HookContext> => {
    accountService(context.app).notifier('resendVerifySignup', context.result)
    return context
  }
}

export default {
  before: {
    all: [],
    find: [],
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
} as any
