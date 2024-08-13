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
import { v4 as uuidv4 } from 'uuid'

import {
  projectPermissionPath,
  ProjectPermissionType
} from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { ProjectQuery, ProjectType } from '@etherealengine/common/src/schemas/projects/project.schema'
import { projectSettingPath } from '@etherealengine/common/src/schemas/setting/project-setting.schema'
import { fromDateTimeSql, getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'
import type { HookContext } from '@etherealengine/server-core/declarations'

export const projectResolver = resolve<ProjectType, HookContext>({
  projectPermissions: virtual(async (project, context) => {
    return context.params.populateProjectPermissions
      ? ((await context.app.service(projectPermissionPath).find({
          query: {
            projectId: project.id
          },
          paginate: false
        })) as ProjectPermissionType[])
      : []
  }),

  settings: virtual(async (project, context) => {
    if (context.event !== 'removed') {
      return await context.app.service(projectSettingPath).find({
        query: {
          projectId: project.id
        },
        paginate: false
      })
    }
  }),

  assetsOnly: virtual(async (project, context) => {
    return !!project.assetsOnly
  }),

  hasLocalChanges: virtual(async (project, context) => {
    return !!project.hasLocalChanges
  }),

  needsRebuild: virtual(async (project, context) => {
    return !!project.needsRebuild
  }),

  commitDate: virtual(async (project) => {
    if (project.commitDate) return fromDateTimeSql(project.commitDate)
  }),
  createdAt: virtual(async (project) => fromDateTimeSql(project.createdAt)),
  updatedAt: virtual(async (project) => fromDateTimeSql(project.updatedAt))
})

export const projectExternalResolver = resolve<ProjectType, HookContext>({})

export const projectDataResolver = resolve<ProjectType, HookContext>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const projectPatchResolver = resolve<ProjectType, HookContext>({
  updatedBy: async (_, __, context) => {
    return context.params?.user?.id || null
  },
  updatedAt: getDateTimeSql
})

export const projectQueryResolver = resolve<ProjectQuery, HookContext>({})
