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

import { Params } from '@feathersjs/feathers'
import { UserApiKeyType } from '@ir-engine/common/src/schema.type.module'
import { ProjectType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import {
  ProjectSettingQuery,
  ProjectSettingType,
  projectSettingPath
} from '@ir-engine/common/src/schemas/setting/project-setting.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'
import { v4 } from 'uuid'
import { createUser, getAuthParams } from './user-test-utils'

export const createProject = async (app: Application, projectName?: string, user?: UserType) => {
  if (!projectName) {
    projectName = `__test/project-${v4()}`
  }

  if (!user) {
    user = await createUser(app)
  }

  const project = await app.service(projectPath).create(
    {
      name: projectName
    },
    {
      user
    }
  )

  return { project, user }
}

/**
 * Helper method used to create project setting. If params are not provided then it will create random ones.
 * @param app
 * @param key
 * @param value
 * @param user
 * @param project
 * @returns
 */
export const createProjectSetting = async (
  app: Application,
  key: string,
  value: string,
  type: ProjectSettingType['type'],
  user?: UserType,
  project?: ProjectType
) => {
  if (!project) {
    const projectResponse = await createProject(app, undefined, user)
    project = projectResponse.project
    user = projectResponse.user
  }

  if (!user) {
    user = await createUser(app)
  }

  const projectSetting = await app.service(projectSettingPath).create(
    {
      key,
      value,
      type,
      projectId: project!.id
    },
    {
      user
    }
  )

  return { projectSetting, project, user }
}

/**
 * Helper method used to get project setting.
 * @param app
 * @param projectSettingId
 * @returns
 */
// export const getProjectSetting = async (app: Application, projectSettingId: string) => {
//   const projectSetting = await app.service(projectSettingPath).get(projectSettingId)
//   return projectSetting
// }

/**
 * Helper method used to find project setting.
 * @param app
 * @param query
 * @param user
 * @returns
 */
export const findProjectSetting = async (app: Application, query: ProjectSettingQuery, userApiKey?: UserApiKeyType) => {
  let params: Params = {}

  if (userApiKey) {
    params = getAuthParams(userApiKey)
  }

  const projectSetting = await app.service(projectSettingPath).find({
    query: {
      ...query
    },
    ...params
  })
  return projectSetting
}

/**
 * Helper method used to patch project setting.
 * @param app
 * @param projectSettingId
 * @param projectSetting
 * @returns
 */
export const patchProjectSetting = async (
  app: Application,
  value: string,
  projectSettingId?: string,
  projectId?: string,
  key?: string
) => {
  const query = {} as ProjectSettingQuery

  if (projectId) {
    query.projectId = projectId
  }

  if (key) {
    query.key = key
  }

  const projectSetting = await app.service(projectSettingPath).patch(
    projectSettingId ?? null,
    {
      value
    },
    {
      query
    }
  )

  return projectSetting
}

/**
 * Helper method used to remove project setting.
 * @param app
 * @param projectSettingId
 * @param projectSetting
 * @returns
 */
export const removeProjectSetting = async (
  app: Application,
  projectSettingId?: string,
  query?: ProjectSettingQuery
) => {
  const projectSetting = await app.service(projectSettingPath).remove(projectSettingId ?? null, {
    query: {
      ...query
    }
  })
  return projectSetting
}
