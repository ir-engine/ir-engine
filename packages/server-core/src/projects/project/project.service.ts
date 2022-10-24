import { Id, Params } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { iff, isProvider } from 'feathers-hooks-common'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import { UserInterface } from '@xrengine/common/src/dbmodels/UserInterface'
import logger from '@xrengine/common/src/logger'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { UserParams } from '../../user/user/user.class'
import { pushProjectToGithub } from './github-helper'
import {
  checkBuilderService,
  checkDestination,
  checkProjectDestinationMatch,
  findBuilderTags,
  getBranches,
  getEnginePackageJson,
  getTags,
  updateBuilder
} from './project-helper'
import { Project, ProjectParams, ProjectParamsClient } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'
import createModel from './project.model'

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    projects: {
      find: () => ReturnType<typeof getProjectsList>
    }
    project: Project
    'project-build': {
      find: ReturnType<typeof projectBuildFind>
      patch: ReturnType<typeof projectBuildPatch>
    }
    'project-invalidate': {
      patch: ReturnType<typeof projectInvalidatePatch>
    }
    'project-check-source-destination-match': {
      find: ReturnType<typeof projectCheckSourceDestinationMatchFind>
    }
    'project-github-push': {
      patch: ReturnType<typeof projectGithubPushPatch>
    }
    'project-destination-check': {
      get: ReturnType<typeof projectDestinationCheckGet>
    }
    'project-branches': {
      get: ReturnType<typeof projectBranchesGet>
    }
    'project-tags': {
      get: ReturnType<typeof projectTagsGet>
    }
    'project-builder-tags': {
      find: ReturnType<typeof projectBuilderTagsGet>
    }
    'builder-version': {
      get: ReturnType<typeof builderVersionGet>
    }
  }
  interface Models {
    project: ReturnType<typeof createModel>
  }
}

/**
 * returns a list of projects installed by name from their folder names
 */
export const getProjectsList = async () => {
  return fs
    .readdirSync(projectsRootFolder)
    .filter((projectFolder) => fs.existsSync(path.join(projectsRootFolder, projectFolder, 'xrengine.config.ts')))
}

export const projectBuildFind = (app: Application) => async () => {
  return await checkBuilderService(app)
}

export const projectBuildPatch = (app: Application) => async (tag: string, data: any, params?: ProjectParamsClient) => {
  return await updateBuilder(app, tag, data, params as ProjectParams)
}

type InvalidateProps = {
  projectName?: string
  storageProviderName?: string
}

export const projectInvalidatePatch =
  (app: Application) =>
  async ({ projectName, storageProviderName }: InvalidateProps) => {
    if (projectName) {
      return await getStorageProvider(storageProviderName).createInvalidation([`projects/${projectName}*`])
    }
  }

export const projectCheckSourceDestinationMatchFind = (app: Application) => (params?: ProjectParamsClient) => {
  return checkProjectDestinationMatch(app, params as ProjectParams)
}

export const projectGithubPushPatch = (app: Application) => async (id: Id, data: any, params?: UserParams) => {
  const project = await app.service('project').Model.findOne({
    where: {
      id
    }
  })
  return pushProjectToGithub(app, project, params!.user!)
}

export const projectDestinationCheckGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return checkDestination(app, url, params as ProjectParams)
}

export const projectBranchesGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return getBranches(app, url, params as ProjectParams)
}

export const projectTagsGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return getTags(app, url, params as ProjectParams)
}

export const projectBuilderTagsGet = () => async () => {
  return findBuilderTags()
}

export const builderVersionGet = () => async () => {
  return getEnginePackageJson().version
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const projectClass = new Project(options, app)
  projectClass.docs = projectDocs

  app.use('project', projectClass)

  // TODO: move these to sub-methods of 'project' service

  app.use('projects', {
    find: getProjectsList
  })

  app.service('projects').hooks({
    before: {
      find: [authenticate()]
    }
  })

  app.use('project-build', {
    find: projectBuildFind(app),
    patch: projectBuildPatch(app)
  })

  app.service('project-build').hooks({
    before: {
      find: [authenticate(), verifyScope('admin', 'admin')],
      patch: [authenticate(), verifyScope('admin', 'admin')]
    }
  })

  app.use('project-invalidate', {
    patch: projectInvalidatePatch(app)
  })

  app.service('project-invalidate').hooks({
    before: {
      patch: [authenticate(), verifyScope('admin', 'admin')]
    }
  })

  app.use('project-check-source-destination-match', {
    find: projectCheckSourceDestinationMatchFind(app)
  })

  app.service('project-check-source-destination-match').hooks({
    before: {
      find: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  app.use('project-github-push', {
    patch: projectGithubPushPatch(app)
  })

  app.service('project-github-push').hooks({
    before: {
      patch: [
        authenticate(),
        iff(isProvider('external'), verifyScope('editor', 'write') as any),
        projectPermissionAuthenticate('write') as any
      ]
    }
  })

  app.use('project-destination-check', {
    get: projectDestinationCheckGet(app)
  })

  app.service('project-destination-check').hooks({
    before: {
      get: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  app.use('project-branches', {
    get: projectBranchesGet(app)
  })

  app.service('project-branches').hooks({
    before: {
      get: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  app.use('project-tags', {
    get: projectTagsGet(app)
  })

  app.service('project-tags').hooks({
    before: {
      get: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  app.use('project-builder-tags', {
    find: projectBuilderTagsGet()
  })

  app.service('project-builder-tags').hooks({
    before: {
      find: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  app.use('builder-version', {
    get: builderVersionGet()
  })

  app.service('builder-version').hooks({
    before: {
      get: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  const service = app.service('project')

  service.hooks(hooks)

  service.publish('patched', async (data: UserInterface): Promise<any> => {
    try {
      let targetIds = []
      const projectOwners = await app.service('project-permission').Model.findAll({
        where: {
          projectId: data.id
        }
      })
      targetIds = targetIds.concat(projectOwners.map((permission) => permission.userId))
      const admins = await app.service('user').Model.findAll({
        include: [
          {
            model: app.service('scope').Model,
            where: {
              type: 'admin:admin'
            }
          }
        ]
      })
      targetIds = targetIds.concat(admins.map((admin) => admin.id))
      targetIds = _.uniq(targetIds)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            project: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
