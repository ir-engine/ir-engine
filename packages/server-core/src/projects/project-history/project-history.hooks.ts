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

import { projectHistoryDataValidator, projectHistoryQueryValidator } from './project-history.schema'

import { projectPermissionPath } from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { BadRequest } from '@feathersjs/errors'
import {
  projectHistoryDataResolver,
  projectHistoryExternalResolver,
  projectHistoryQueryResolver,
  projectHistoryResolver
} from './project-history.resolvers'

import {
  AvatarID,
  avatarPath,
  AvatarType,
  userAvatarPath,
  UserID,
  userPath
} from '@etherealengine/common/src/schema.type.module'
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

    if (!userId) {
      // If userId is not present, then it is a system action (or admin action)
      continue
    }

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

const populateUsernameAndAvatar = async (context: HookContext<ProjectHistoryService>) => {
  if (!context.result) return
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  const userIds: UserID[] = []

  for (const data of dataArr) {
    const { userId } = data
    if (userId) userIds.push(userId)
  }
  const uniqueUsers = [...new Set(userIds)]
  const nonNullUsers = uniqueUsers.filter((userId) => !!userId)

  const users = await context.app.service(userPath).find({
    query: {
      id: {
        $in: nonNullUsers
      }
    },
    paginate: false
  })

  const userAvatars = await context.app.service(userAvatarPath).find({
    query: {
      userId: {
        $in: nonNullUsers
      }
    },
    paginate: false
  })

  const uniqueUserAvatarIds = [...new Set(userAvatars.map((avatar) => avatar.avatarId))]
  const avatars = await context.app.service(avatarPath).find({
    query: {
      id: {
        $in: uniqueUserAvatarIds
      }
    },
    paginate: false
  })

  const avatarIdAvatarMap = {} as Record<AvatarID, AvatarType>
  for (const avatar of avatars) {
    avatarIdAvatarMap[avatar.id] = avatar
  }

  const userIdAvatarIdMap = {} as Record<UserID, AvatarType>
  for (const userAvatar of userAvatars) {
    userIdAvatarIdMap[userAvatar.userId] = avatarIdAvatarMap[userAvatar.avatarId]
  }

  const usersInfo = {} as Record<UserID, { userName: string; userAvatarURL: string }>
  for (const user of users) {
    usersInfo[user.id] = {
      userName: user.name,
      userAvatarURL: userIdAvatarIdMap[user.id].thumbnailResource?.url || ''
    }
  }

  context.userInfo = usersInfo
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
      schemaHooks.validateQuery(projectHistoryQueryValidator),
      schemaHooks.resolveQuery(projectHistoryQueryResolver)
    ],
    find: [iff(isProvider('external'))],
    get: [disallow('external')],
    create: [
      disallow('external'),
      schemaHooks.validateData(projectHistoryDataValidator),
      schemaHooks.resolveData(projectHistoryDataResolver),
      checkProjectAccess
    ],
    patch: [disallow('external')],
    update: [disallow('external')],
    remove: [disallow('external')]
  },

  after: {
    all: [],
    find: [populateUsernameAndAvatar],
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
