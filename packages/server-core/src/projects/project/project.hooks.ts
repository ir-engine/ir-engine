import { HookContext } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'

import authenticate from '../../hooks/authenticate'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'

export default {
  before: {
    all: [authenticate()],
    find: [],
    get: [],
    create: [iff(isProvider('external'), verifyScope('editor', 'write') as any)],
    update: [iff(isProvider('external'), verifyScope('editor', 'write') as any), projectPermissionAuthenticate(false)],
    patch: [iff(isProvider('external'), verifyScope('editor', 'write') as any), projectPermissionAuthenticate(false)],
    remove: [iff(isProvider('external'), verifyScope('editor', 'write') as any), projectPermissionAuthenticate(false)]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      (context: HookContext) => {
        return context.params?.user?.id
          ? context.app.service('project-permission').create({
              userId: context.params.user.id,
              projectId: context.result.id,
              type: 'owner'
            })
          : context
      }
    ],
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
