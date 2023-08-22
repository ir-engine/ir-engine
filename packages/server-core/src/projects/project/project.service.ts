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

import { iff, isProvider } from 'feathers-hooks-common'
import _ from 'lodash'

import logger from '@etherealengine/common/src/logger'
import { getState } from '@etherealengine/hyperflux'

import { projectPermissionPath } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import { ScopeType, scopePath } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { UserID, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'
import config from '../../appconfig'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import {
  checkDestination,
  dockerHubRegex,
  findBuilderTags,
  getBranches,
  getEnginePackageJson,
  getProjectCommits,
  privateECRTagRegex,
  publicECRTagRegex
} from './project-helper'
import { Project, ProjectParams, ProjectParamsClient } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'
import createModel from './project.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    project: Project
    'project-destination-check': {
      get: ReturnType<typeof projectDestinationCheckGet>
    }
    'project-branches': {
      get: ReturnType<typeof projectBranchesGet>
    }
    'project-commits': {
      get: ReturnType<typeof projectCommitsGet>
    }
    'project-builder-tags': {
      find: ReturnType<typeof projectBuilderTagsGet>
    }
    'builder-info': {
      get: ReturnType<typeof builderInfoGet>
    }
  }
}

export const projectDestinationCheckGet = (app: Application) => async (url: string, params?: ProjectParamsClient) => {
  return checkDestination(app, url, params as ProjectParams)
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
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const projectClass = new Project(options, app)
  projectClass.docs = projectDocs

  app.use('project', projectClass)

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

  const service = app.service('project')

  service.hooks(hooks)

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
