/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
import { checkScope } from '@etherealengine/spatial/src/common/functions/checkScope'
import { HookContext } from '../../../declarations'
import { ProjectHistoryService } from './project-history.class'

const checkProjectAccess = async (context: HookContext<ProjectHistoryService>) => {
  const isAdmin = context.params.user && (await checkScope(context.params.user, 'admin', 'admin'))
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

  context.parms['usersInfo'] = usersInfo
  context.params['staticResourcesInfo'] = staticResourcesInfo
}

export default {
  around: {
    all: [
      schemaHooks.resolveResult(projectHistoryResolver),
      schemaHooks.resolveExternal(projectHistoryExternalResolver)
    ]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(projectHistoryQueryValidator),
      schemaHooks.resolveQuery(projectHistoryQueryResolver)
    ],
    find: [iff(isProvider('external'), setLoggedinUserInQuery('userId'), checkProjectAccess, populateData)],
    get: [iff(isProvider('external'), setLoggedinUserInQuery('userId'), checkProjectAccess, populateData)],
    create: [
      () => schemaHooks.validateData(projectHistoryDataValidator),
      iff(isProvider('external'), setLoggedinUserInQuery('userId'), checkProjectAccess),
      schemaHooks.resolveData(projectHistoryDataResolver)
    ],
    patch: [disallow('external')],
    update: [disallow('external')],
    remove: [iff(isProvider('external'), verifyScope('admin', 'admin'))]
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
