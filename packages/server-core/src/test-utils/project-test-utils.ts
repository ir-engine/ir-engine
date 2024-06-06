import { ProjectType, projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import {
  ProjectSettingQuery,
  projectSettingPath
} from '@etherealengine/common/src/schemas/setting/project-setting.schema'
import { UserType } from '@etherealengine/common/src/schemas/user/user.schema'
import { Application } from '@etherealengine/server-core/declarations'
import { createUser } from './user-test-utils'

export const createProject = async (app: Application, projectName?: string, user?: UserType) => {
  if (!projectName) {
    projectName = `project-${Math.floor(Math.random() * (999 - 100 + 1) + 100)}`
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
      projectId: project.id
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
export const getProjectSetting = async (app: Application, projectSettingId: string) => {
  const projectSetting = await app.service(projectSettingPath).get(projectSettingId)
  return projectSetting
}

/**
 * Helper method used to find project setting.
 * @param app
 * @param projectSettingId
 * @param projectSetting
 * @returns
 */
export const findProjectSetting = async (app: Application, query: ProjectSettingQuery) => {
  const projectSetting = await app.service(projectSettingPath).find({
    query: {
      ...query
    }
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
  const projectSetting = await app.service(projectSettingPath).patch(
    projectSettingId ?? null,
    {
      value
    },
    {
      query: {
        projectId,
        key
      }
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
