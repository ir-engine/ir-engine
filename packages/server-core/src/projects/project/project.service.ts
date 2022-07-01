import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { iff, isProvider } from 'feathers-hooks-common'
import _ from 'lodash'

import { UserInterface } from '@xrengine/common/src/dbmodels/UserInterface'
import logger from '@xrengine/common/src/logger'
import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { pushProjectToGithub } from '../githubapp/githubapp-helper'
import { retriggerBuilderService } from './project-helper'
import { Project } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'
import createModel from './project.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    project: Project
    'project-build': any
    'project-invalidate': any
    'project-github-push': any
  }
  interface Models {
    project: ReturnType<typeof createModel>
  }
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

  app.use('project-build', {
    patch: async ({ rebuild }, params) => {
      if (rebuild) {
        return await retriggerBuilderService(app)
      }
    }
  })

  app.use('project-invalidate', {
    patch: async ({ projectName }, params) => {
      if (projectName) {
        return await getStorageProvider().createInvalidation([`projects/${projectName}*`])
      }
    }
  })

  app.service('project-build').hooks({
    before: {
      patch: [authenticate(), restrictUserRole('admin')]
    }
  })

  app.service('project-invalidate').hooks({
    before: {
      patch: [authenticate(), restrictUserRole('admin')]
    }
  })

  app.use('project-github-push', {
    patch: async (id: Id, data: any, params?: Params): Promise<any> => {
      const project = await app.service('project').Model.findOne({
        where: {
          id
        }
      })
      return pushProjectToGithub(app, project, params!.user)
    }
  })

  app.service('project-github-push').hooks({
    before: {
      patch: [
        authenticate(),
        iff(isProvider('external'), verifyScope('editor', 'write') as any),
        projectPermissionAuthenticate('write')
      ]
    }
  })

  const service = app.service('project')

  service.hooks(hooks)

  service.publish('patched', async (data: UserInterface, params): Promise<any> => {
    try {
      let targetIds = []
      const projectOwners = await app.service('project-permission').Model.findAll({
        where: {
          projectId: data.id
        }
      })
      targetIds = targetIds.concat(projectOwners.map((permission) => permission.userId))
      const admins = await app.service('user').Model.findAll({
        where: {
          userRole: 'admin'
        }
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
