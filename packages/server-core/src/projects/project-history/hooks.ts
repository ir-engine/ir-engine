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

import { projectPath, projectPermissionPath, userPath } from '@etherealengine/common/src/schema.type.module'
import { ActionType, projectHistoryPath } from '@etherealengine/common/src/schemas/projects/project-history.schema'
import { HookContext } from '../../../declarations'
import { ProjectPermissionService } from '../project-permission/project-permission.class'
import projectPermissionHooks from '../project-permission/project-permission.hooks'
import { ProjectService } from '../project/project.class'
import projectHooks from '../project/project.hooks'

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
      actionIdentifierType: projectPermissionPath,
      actionDetail: JSON.stringify(actionDetail)
    })
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
      actionIdentifierType: projectPath,
      actionDetail: actionDetailStr
    })
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

projectHooks.after.create.unshift(updateProjectHistory)

projectPermissionHooks.before.patch.unshift(storePermissionType)
projectPermissionHooks.after.create.unshift(updateProjectPermissionHistory)
projectPermissionHooks.after.patch.unshift(updateProjectPermissionHistory)
projectPermissionHooks.after.remove.unshift(updateProjectPermissionHistory)
