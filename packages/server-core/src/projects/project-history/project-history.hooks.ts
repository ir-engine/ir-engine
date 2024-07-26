import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  projectHistoryDataValidator,
  projectHistoryQueryValidator,
  ResourceActionTypes,
  UserActionTypes
} from './project-history.schema'

import { projectPermissionPath } from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import setLoggedinUserInQuery from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-query'
import verifyScope from '@etherealengine/server-core/src/hooks/verify-scope'
import { BadRequest } from '@feathersjs/errors'
import {
  projectHistoryDataResolver,
  projectHistoryExternalResolver,
  projectHistoryQueryResolver,
  projectHistoryResolver
} from './project-history.resolvers'

import { staticResourcePath, UserID, userPath } from '@etherealengine/common/src/schema.type.module'
import { isSuperAdmin } from '@etherealengine/projects/projects/eepro-multitenancy/services/hooks/common/is-super-admin'
import { HookContext } from '../../../declarations'
import { ProjectHistoryService } from './project-history.class'

const checkProjectAccess = async (context: HookContext<ProjectHistoryService>) => {
  const isAdmin = await isSuperAdmin(context)
  if (isAdmin) {
    return
  }
  if (!context.data) return
  const dataArr = Array.isArray(context.data) ? context.data : [context.data]

  for (const data of dataArr) {
    const { projectId, userId } = data

    const projectPermission = await context.app.service(projectPermissionPath).find({
      query: {
        projectId,
        userId
      }
    })

    if (projectPermission.total === 0) {
      throw new BadRequest('No permission to access project')
    }
  }
}

const populateData = async (context: HookContext<ProjectHistoryService>) => {
  if (!context.data) return
  const dataArr = Array.isArray(context.data) ? context.data : [context.data]

  const userIds: UserID[] = []
  const staticResourceIds: string[] = []

  for (const data of dataArr) {
    const { userId } = data
    if (userId) {
      userIds.push(userId)
    }

    if (!data.action || !data.actionIdentifier) {
      continue
    }

    if (data.action in ResourceActionTypes) {
      staticResourceIds.push(data.actionIdentifier)
    }

    if (data.action in UserActionTypes) {
      userIds.push(data.actionIdentifier as UserID)
    }
  }
  const uniqueUsers = [...new Set(userIds)]
  const users = await context.app.service(userPath).find({
    query: {
      id: {
        $in: uniqueUsers
      }
    },
    paginate: false
  })
  const usersInfo = {} as Record<UserID, { userName: string; userAvatarURL: string }>
  for (const user of users) {
    usersInfo[user.id] = {
      userName: user.name,
      userAvatarURL: user.avatar?.thumbnailResource?.url || ''
    }
  }

  const uniqueStaticResources = [...new Set(staticResourceIds)]
  const staticResources = await context.app.service(staticResourcePath).find({
    query: {
      id: {
        $in: uniqueStaticResources
      }
    },
    paginate: false
  })
  const staticResourcesInfo = {} as Record<string, string>
  for (const resource of staticResources) {
    staticResourcesInfo[resource.id] = resource.key
  }

  context.usersInfo = usersInfo
  context.staticResourcesInfo = staticResourcesInfo
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(projectHistoryExternalResolver),
      schemaHooks.resolveResult(projectHistoryResolver)
    ]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(projectHistoryQueryValidator),
      schemaHooks.resolveQuery(projectHistoryQueryResolver)
    ],
    find: [iff(isProvider('external'), setLoggedinUserInQuery('userId'), checkProjectAccess)],
    get: [disallow('external')],
    create: [
      () => schemaHooks.validateData(projectHistoryDataValidator),
      iff(isProvider('external'), setLoggedinUserInQuery('userId'), checkProjectAccess),
      schemaHooks.resolveData(projectHistoryDataResolver)
    ],
    patch: [disallow('external')],
    update: [disallow('external')],
    remove: [iff(isProvider('external'), verifyScope('admin', 'super'))]
  },

  after: {
    all: [],
    find: [populateData],
    get: [populateData],
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
