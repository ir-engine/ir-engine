import * as feathersAuthentication from '@feathersjs/authentication'
import { hooks } from '@feathersjs/authentication-local'
import accountService from '../auth-management/auth-management.notifier'
import { HookContext, Hook } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'
import { NotFound } from '@feathersjs/errors'

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

const checkIdentityProvider = (): any => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.id) {
      // If trying to CRUD a specific identity-provider, throw 404 if the user doesn't own it
      const thisIdentityProvider = await (context.app.service('identity-provider') as any).Model.findByPk(context.id)
      if (
        context.params['identity-provider'] &&
        context.params['identity-provider'].userId !== thisIdentityProvider.userId
      )
        throw new NotFound()
    } else {
      // If trying to CRUD multiple identity-providers, e.g. patch all IP's belonging to a user, make params.query.userId
      // the ID of the calling user, so no one can alter anyone else's IPs.
      const userId = context.params['identity-provider']?.userId
      if (!userId) throw new NotFound()
      if (!context.params.query) context.params.query = {}
      context.params.query.userId = userId
    }
    if (context.data) context.data = { password: context.data.password } //If patching externally, should only be able to change password
    return context
  }
}

export default {
  before: {
    all: [],
    find: [iff(isProvider('external'), authenticate('jwt') as any)],
    get: [iff(isProvider('external'), authenticate('jwt') as any, checkIdentityProvider())],
    create: [],
    update: [iff(isProvider('external'), authenticate('jwt') as any, checkIdentityProvider())],
    patch: [iff(isProvider('external'), authenticate('jwt') as any, checkIdentityProvider())],
    remove: [iff(isProvider('external'), authenticate('jwt') as any, checkIdentityProvider())]
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
