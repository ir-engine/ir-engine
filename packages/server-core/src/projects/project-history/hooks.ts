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

import {
  locationPath,
  projectPath,
  projectPermissionPath,
  staticResourcePath,
  userPath
} from '@etherealengine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import { StaticResourceService } from '../../media/static-resource/static-resource.class'
import staticResourceHooks from '../../media/static-resource/static-resource.hooks'
import { LocationService } from '../../social/location/location.class'
import locationHooks from '../../social/location/location.hooks'
import { ProjectPermissionService } from '../project-permission/project-permission.class'
import projectPermissionHooks from '../project-permission/project-permission.hooks'
import { ProjectService } from '../project/project.class'
import projectHooks from '../project/project.hooks'
import { ActionType, projectHistoryPath } from './project-history.schema'

const updateProjectPermissionHistory = async (context: HookContext<ProjectPermissionService>) => {
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  let action: ActionType

  switch (context.method) {
    case 'create':
      action = 'PERMISSION_CREATED'
      break
    case 'patch':
    case 'update':
      action = 'PERMISSION_MODIFIED'
      break
    case 'remove':
      action = 'PERMISSION_REMOVED'
      break
    default:
      return
  }

  for (const item of dataArr) {
    const user = await context.app.service(userPath).get(item.userId)
    const actionDetail = {
      userName: user.name
    }
    if (action === 'PERMISSION_MODIFIED') {
      actionDetail['oldPermissionType'] = context['permissionTypeBeforeUpdate'][item.id] || ''
      actionDetail['newPermissionType'] = item.type
    } else {
      actionDetail['permissionType'] = item.type
    }

    await context.app.service(projectHistoryPath).create({
      projectId: item.projectId,
      userId: context.params.user?.id || null,
      action: action,
      actionIdentifier: item.id,
      actionIdentiferType: projectPermissionPath,
      actionDetail: JSON.stringify(actionDetail)
    })
  }
}

const updateLocationHistory = async (context: HookContext<LocationService>) => {
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []
  const action = context.method === 'create' ? 'LOCATION_PUBLISHED' : 'LOCATION_UNPUBLISHED'

  for (const item of dataArr) {
    // TODO: Try to avoid this API call, because location resolver does the same thing
    const scene = await context.app.service(staticResourcePath).get(item.sceneId)

    await context.app.service(projectHistoryPath).create({
      projectId: item.projectId,
      userId: context.params.user?.id || null,
      action: action,
      actionIdentifier: item.id,
      actionIdentiferType: locationPath,
      actionDetail: JSON.stringify({
        locationName: item.slugifiedName,
        sceneURL: scene.key,
        sceneId: item.sceneId
      })
    })
  }
}

const updateStaticResourceHistory = async (context: HookContext<StaticResourceService>) => {
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  for (const item of dataArr) {
    if (item.project) {
      const projectResult = await context.app.service(projectPath).find({
        query: {
          name: item.project
        }
      })

      if (projectResult.total !== 1) {
        // Valid project not found. Skip writing into project history
        continue
      }

      const project = projectResult.data[0]

      let actionType: ActionType

      const actionDetail = {}

      if (context.method === 'create') {
        actionDetail['url'] = item.key
        actionType = 'RESOURCE_CREATED'
      } else if (context.method === 'update' || context.method === 'patch') {
        const keyBeforeUpdate = (context?.keyBeforeUpdate?.[item.id] || '') as string
        if (!keyBeforeUpdate) {
          actionDetail['url'] = item.key
          actionType = 'RESOURCE_MODIFIED'
        } else {
          const newURL = item.key
          const oldURL = keyBeforeUpdate

          if (newURL !== oldURL) {
            actionDetail['oldURL'] = oldURL
            actionDetail['newURL'] = newURL
            actionType = 'RESOURCE_RENAMED'
          } else {
            actionDetail['url'] = item.key
            actionType = 'RESOURCE_MODIFIED'
          }
        }
      } else {
        actionDetail['url'] = item.key
        actionType = 'RESOURCE_REMOVED'
      }

      if (item.type === 'scene') {
        actionType = actionType.replace('RESOURCE', 'SCENE') as ActionType
      }

      const actionDetailStr = JSON.stringify(actionDetail)

      await context.app.service(projectHistoryPath).create({
        projectId: project.id,
        userId: context.params.user?.id || null,
        action: actionType,
        actionIdentifier: item.id,
        actionIdentiferType: staticResourcePath,
        actionDetail: actionDetailStr
      })
    }
  }
}

const updateProjectHistory = async (context: HookContext<ProjectService>) => {
  const data = context.result
  const dataArr = data ? (Array.isArray(data) ? data : 'data' in data ? data.data : [data]) : []

  for (const item of dataArr) {
    const actionDetail = {
      projectName: item.name
    }
    const actionDetailStr = JSON.stringify(actionDetail)

    await context.app.service(projectHistoryPath).create({
      projectId: item.id,
      userId: context.params.user?.id || null,
      action: 'PROJECT_CREATED',
      actionIdentifier: item.id,
      actionIdentiferType: projectPath,
      actionDetail: actionDetailStr
    })
  }
}

const storeResourceKey = async (context: HookContext<StaticResourceService>) => {
  context.keyBeforeUpdate = {} as Record<string, string>

  const resources = await context.app.service(staticResourcePath).find({
    query: {
      id: context.id as string
    },
    paginate: false
  })

  for (const resource of resources) {
    context['keyBeforeUpdate'][resource.id] = resource.key
  }
}

const storePermissionType = async (context: HookContext<ProjectPermissionService>) => {
  context.permissionTypeBeforeUpdate = {} as Record<string, string>

  const projectPermissions = await context.app.service(projectPermissionPath).find({
    query: {
      id: context.id as string
    },
    paginate: false
  })

  for (const projectPermission of projectPermissions) {
    context['permissionTypeBeforeUpdate'][projectPermission.id] = projectPermission.type
  }
}

staticResourceHooks.before.update.unshift(storeResourceKey)
staticResourceHooks.before.patch.unshift(storeResourceKey)

staticResourceHooks.after.create.unshift(updateStaticResourceHistory)
staticResourceHooks.after.update.unshift(updateStaticResourceHistory)
staticResourceHooks.after.patch.unshift(updateStaticResourceHistory)
staticResourceHooks.after.remove.unshift(updateStaticResourceHistory)

projectHooks.after.create.unshift(updateProjectHistory)
locationHooks.after.create.unshift(updateLocationHistory)
locationHooks.after.remove.unshift(updateLocationHistory)

projectPermissionHooks.before.patch.unshift(storePermissionType)
projectPermissionHooks.after.create.unshift(updateProjectPermissionHistory)
projectPermissionHooks.after.patch.unshift(updateProjectPermissionHistory)
projectPermissionHooks.after.remove.unshift(updateProjectPermissionHistory)
