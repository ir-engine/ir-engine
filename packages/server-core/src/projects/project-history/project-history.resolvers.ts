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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { staticResourcePath, userPath } from '@etherealengine/common/src/schema.type.module'
import { fromDateTimeSql, getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'
import type { HookContext } from '@etherealengine/server-core/declarations'
import { ProjectHistoryQuery, ProjectHistoryType, ResourceActionTypes, UserActionTypes } from './project-history.schema'

export const projectHistoryResolver = resolve<ProjectHistoryType, HookContext>({
  createdAt: virtual(async (projectHistory) => fromDateTimeSql(projectHistory.createdAt))
})

export const projectHistoryDataResolver = resolve<ProjectHistoryType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql
})

export const projectHistoryExternalResolver = resolve<ProjectHistoryType, HookContext>({
  userName: virtual(async (projectHistory, context) => {
    if (projectHistory.userId in context.usersInfo) {
      return context.usersInfo[projectHistory.userId].userName
    }

    const user = await context.app.service(userPath).get(projectHistory.userId)
    context.userInfo[projectHistory.userId] = {
      userName: user.name,
      userAvatar: user.avatar?.thumbnailResource?.url || ''
    }

    return user.name
  }),

  userAvatar: virtual(async (projectHistory, context) => {
    if (projectHistory.userId in context.usersInfo) {
      return context.usersInfo[projectHistory.userId].userAvatarURL
    }
    const user = await context.app.service(userPath).get(projectHistory.userId)
    context.userInfo[projectHistory.userId] = {
      userName: user.name,
      userAvatar: user.avatar?.thumbnailResource?.url || ''
    }

    return user.avatar?.thumbnailResource?.url || ''
  }),

  actionResource: virtual(async (projectHistory, context) => {
    if (projectHistory.action in UserActionTypes) {
      const userId = projectHistory.actionIdentifier
      if (userId in context.usersInfo) {
        return context.usersInfo[userId].userName
      }

      const user = await context.app.service(userPath).get(userId)
      context.userInfo[userId] = {
        userName: user.name,
        userAvatar: user.avatar?.thumbnailResource?.url || ''
      }

      return user.name
    } else if (projectHistory.action in ResourceActionTypes) {
      const resourceId = projectHistory.actionIdentifier
      if (resourceId in context.staticResourcesInfo) {
        return context.staticResourcesInfo[resourceId].name
      }

      const resource = await context.app.service(staticResourcePath).get(resourceId)
      context.staticResourcesInfo[resourceId] = resource.key

      return resource.key
    }
  })
})

export const projectHistoryQueryResolver = resolve<ProjectHistoryQuery, HookContext>({})
