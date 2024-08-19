/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  projectHistoryDataValidator,
  projectHistoryQueryValidator
} from '@ir-engine/common/src/schemas/projects/project-history.schema'

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
} from '@ir-engine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import checkScope from '../../hooks/check-scope'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import { ProjectHistoryService } from './project-history.class'

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
    find: [
      iff(isProvider('external'), iffElse(checkScope('projects', 'read'), [], verifyProjectPermission(['owner'])))
    ],
    get: [disallow('external')],
    create: [
      disallow('external'),
      schemaHooks.validateData(projectHistoryDataValidator),
      schemaHooks.resolveData(projectHistoryDataResolver)
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
