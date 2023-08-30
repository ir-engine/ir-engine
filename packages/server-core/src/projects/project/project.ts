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

import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { iff, isProvider } from 'feathers-hooks-common'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import logger from '@etherealengine/common/src/logger'
import { getState } from '@etherealengine/hyperflux'

import { projectPermissionPath } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import { ProjectType, projectMethods, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { ScopeType, scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { UserID, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'
import { UserParams } from '../../api/root-params'
import config from '../../appconfig'
import authenticate from '../../hooks/authenticate'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { pushProjectToGithub } from './github-helper'
import {
  checkBuilderService,
  checkDestination,
  checkProjectDestinationMatch,
  checkUnfetchedSourceCommit,
  dockerHubRegex,
  findBuilderTags,
  getBranches,
  getEnginePackageJson,
  getProjectCommits,
  privateECRTagRegex,
  publicECRTagRegex,
  updateBuilder
} from './project-helper'
import { ProjectParams, ProjectParamsClient, ProjectService } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [projectPath]: ProjectService
  }

  interface ServiceTypes {
    'project-build': {
      find: ReturnType<typeof projectBuildFind>
      patch: ReturnType<typeof projectBuildPatch>
    }
  }

  interface ServiceTypes {
    'project-invalidate': {
      patch: ReturnType<typeof projectInvalidatePatch>
    }
  }

  interface ServiceTypes {
    'project-check-source-destination-match': {
      find: ReturnType<typeof projectCheckSourceDestinationMatchFind>
    }
  }

  interface ServiceTypes {
    'project-github-push': {
      patch: ReturnType<typeof projectGithubPushPatch>
    }
  }

  interface ServiceTypes {
    'project-destination-check': {
      get: ReturnType<typeof projectDestinationCheckGet>
    }
  }

  interface ServiceTypes {
    'project-branches': {
      get: ReturnType<typeof projectBranchesGet>
    }
  }

  interface ServiceTypes {
    'project-commits': {
      get: ReturnType<typeof projectCommitsGet>
    }
  }

  interface ServiceTypes {
    'project-builder-tags': {
      find: ReturnType<typeof projectBuilderTagsGet>
    }
  }

  interface ServiceTypes {
    'builder-info': {
      get: ReturnType<typeof builderInfoGet>
    }
  }

  interface ServiceTypes {
    'project-check-unfetched-commit': {
      get: ReturnType<typeof projectUnfetchedCommitGet>
    }
  }

  interface ServiceTypes {
    projects: {
      find: () => ReturnType<typeof getProjectsList>
    }
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

export const projectGithubPushPatch = (app: Application) => async (id: string, data: any, params?: UserParams) => {
  const project = (await app.service(projectPath)._find({
    query: {
      id,
      $limit: 1
    }
  })) as Paginated<ProjectType>
  return pushProjectToGithub(app, project.data[0], params!.user!)
}

export const projectDestinationCheckGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return checkDestination(app, url, params as ProjectParams)
}

export const projectUnfetchedCommitGet = (app: Application) => (url: string, params?: ProjectParamsClient) => {
  return checkUnfetchedSourceCommit(app, url, params as ProjectParams)
}

export const projectBranchesGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return getBranches(app, url, params as ProjectParams)
}

export const projectCommitsGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return getProjectCommits(app, url, params as ProjectParams)
}

export const projectBuilderTagsGet = () => async () => {
  return findBuilderTags()
}

export const builderInfoGet = (app: Application) => async () => {
  const returned = {
    engineVersion: getEnginePackageJson().version || '',
    engineCommit: ''
  }

  const k8AppsClient = getState(ServerState).k8AppsClient
  const k8BatchClient = getState(ServerState).k8BatchClient

  if (k8AppsClient) {
    const builderLabelSelector = `app.kubernetes.io/instance=${config.server.releaseName}-builder`

    const builderJob = await k8BatchClient.listNamespacedJob(
      'default',
      undefined,
      false,
      undefined,
      undefined,
      builderLabelSelector
    )

    let builderContainer
    if (builderJob && builderJob.body.items.length > 0) {
      builderContainer = builderJob?.body?.items[0]?.spec?.template?.spec?.containers?.find(
        (container) => container.name === 'etherealengine-builder'
      )
    } else {
      const builderDeployment = await k8AppsClient.listNamespacedDeployment(
        'default',
        'false',
        false,
        undefined,
        undefined,
        builderLabelSelector
      )
      builderContainer = builderDeployment?.body?.items[0]?.spec?.template?.spec?.containers?.find(
        (container) => container.name === 'etherealengine-builder'
      )
    }
    if (builderContainer) {
      const image = builderContainer.image
      if (image && typeof image === 'string') {
        const dockerHubRegexExec = dockerHubRegex.exec(image)
        const publicECRRegexExec = publicECRTagRegex.exec(image)
        const privateECRRegexExec = privateECRTagRegex.exec(image)
        returned.engineCommit =
          dockerHubRegexExec && !publicECRRegexExec
            ? dockerHubRegexExec[1]
            : publicECRRegexExec
            ? publicECRRegexExec[1]
            : privateECRRegexExec
            ? privateECRRegexExec[0]
            : ''
      }
    }
  }
  return returned
}

export default (app: Application): void => {
  const options = {
    name: projectPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(projectPath, new ProjectService(options, app), {
    // A list of all methods this service exposes externally
    methods: projectMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: projectDocs
  })

  const service = app.service(projectPath)
  service.hooks(hooks)

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

  app.use('project-check-unfetched-commit', {
    get: projectUnfetchedCommitGet(app)
  })

  app.service('project-check-unfetched-commit').hooks({
    before: {
      get: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
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
        iff(isProvider('external'), verifyScope('editor', 'write') as any, projectPermissionAuthenticate('write'))
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

  app.use('project-commits', {
    get: projectCommitsGet(app)
  })

  app.service('project-commits').hooks({
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

  app.use('builder-info', {
    get: builderInfoGet(app)
  })

  app.service('builder-info').hooks({
    before: {
      get: [authenticate(), iff(isProvider('external'), verifyScope('projects', 'read') as any) as any]
    }
  })

  service.publish('patched', async (data: UserType) => {
    try {
      let targetIds: string[] = []
      const projectOwners = await app.service(projectPermissionPath)._find({
        query: {
          projectId: data.id
        },
        paginate: false
      })
      targetIds = targetIds.concat(projectOwners.map((permission) => permission.userId))

      const adminScopes = (await app.service(scopePath).find({
        query: {
          type: 'admin:admin'
        },
        paginate: false
      })) as ScopeType[]

      targetIds = targetIds.concat(adminScopes.map((admin) => admin.userId!))
      targetIds = _.uniq(targetIds)
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
