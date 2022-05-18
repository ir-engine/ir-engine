import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
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

  const service = app.service('project')

  service.hooks(hooks)
}
