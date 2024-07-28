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

import { avatarPath, staticResourcePath, userPath } from '@etherealengine/common/src/schema.type.module'
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

const getUserNameAndAvatarId = async (projectHistory: ProjectHistoryType, context: HookContext) => {
  if (context.method !== 'find' && context.method !== 'get') {
    return {
      userName: '',
      avatarId: ''
    }
  }

  if (!projectHistory.userId) {
    return {
      userName: '',
      avatarId: ''
    }
  }

  if (!('userNames' in context.params)) {
    context.params['userNames'] = {} as Record<string, string>
  }

  if (!('avatarIds' in context.params)) {
    context.params['avatarIds'] = {} as Record<string, string>
  }

  if (projectHistory.userId in context.params['userNames']) {
    return {
      userName: context.params['userNames'][projectHistory.userId],
      avatarId: context.params['avatarIds'][projectHistory.userId]
    }
  }

  const user = await context.app.service(userPath).get(projectHistory.userId)
  context.params['userNames'][projectHistory.userId] = user.name
  context.params['avatarIds'][projectHistory.userId] = user.avatarId

  return {
    userName: user.name,
    avatarId: user.avatarId
  }
}

export const projectHistoryExternalResolver = resolve<ProjectHistoryType, HookContext>({
  userName: virtual(async (projectHistory, context) => {
    return (await getUserNameAndAvatarId(projectHistory, context)).userName
  }),

  userAvatar: virtual(async (projectHistory, context) => {
    if (context.method !== 'find' && context.method !== 'get') {
      return ''
    }

    if (!projectHistory.userId) {
      return ''
    }

    if (!('userAvatars' in context.params)) {
      console.log('userAvatars not in context.params. Creating new object')
      context.params['userAvatars'] = {} as Record<string, string>
    }

    if (projectHistory.userId in context.params['userAvatars']) {
      console.log(`User ${projectHistory.userId} already in userAvatars`)
      return context.params['userAvatars'][projectHistory.userId].userAvatarURL
    }

    const avatarId = (await getUserNameAndAvatarId(projectHistory, context)).avatarId

    const avatar = await context.app.service(avatarPath).get(avatarId)

    context.params['userAvatars'][projectHistory.userId] = avatar?.thumbnailResource?.url

    return avatar?.thumbnailResource?.url || ''
  }),

  actionResource: virtual(async (projectHistory, context) => {
    if (context.method !== 'find' && context.method !== 'get') {
      return ''
    }

    if (UserActionTypes.includes(projectHistory.action)) {
      return (await getUserNameAndAvatarId(projectHistory, context)).userName
    } else if (ResourceActionTypes.includes(projectHistory.action)) {
      const resourceId = projectHistory.actionIdentifier

      if (!resourceId) {
        return ''
      }

      if (!('staticResourcesKeys' in context)) {
        context.params['staticResourcesKeys'] = {} as Record<string, string>
      }

      if (resourceId in context.params['staticResourcesKeys']) {
        return context.params['staticResourcesKeys'][resourceId]
      }

      const resource = await context.app.service(staticResourcePath).get(resourceId)
      context.params['staticResourcesKeys'][resourceId] = resource.key

      return resource.key
    }

    return projectHistory.action
  })
})

export const projectHistoryQueryResolver = resolve<ProjectHistoryQuery, HookContext>({})
