import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow } from 'feathers-hooks-common'

import {
  userAvatarDataValidator,
  userAvatarPatchValidator,
  userAvatarQueryValidator
} from '@etherealengine/engine/src/schemas/user/user-avatar.schema'

import {
  userAvatarDataResolver,
  userAvatarExternalResolver,
  userAvatarPatchResolver,
  userAvatarQueryResolver,
  userAvatarResolver
} from './user-avatar.resolvers'

export default {
  around: {
    all: [schemaHooks.resolveExternal(userAvatarExternalResolver), schemaHooks.resolveResult(userAvatarResolver)]
  },

  before: {
    all: [
      disallow('external'),
      () => schemaHooks.validateQuery(userAvatarQueryValidator),
      schemaHooks.resolveQuery(userAvatarQueryResolver)
    ],
    find: [],
    get: [],
    create: [() => schemaHooks.validateData(userAvatarDataValidator), schemaHooks.resolveData(userAvatarDataResolver)],
    patch: [() => schemaHooks.validateData(userAvatarPatchValidator), schemaHooks.resolveData(userAvatarPatchResolver)],
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
