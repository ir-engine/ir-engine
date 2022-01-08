import * as authentication from '@feathersjs/authentication'

import restrictUserRole from '@xrengine/server-core/src/hooks/restrict-user-role'

import { Application } from '../../../declarations'
import { retriggerBuilderService } from './project-helper'
import { Project } from './project.class'
import projectDocs from './project.docs'
import hooks from './project.hooks'
import createModel from './project.model'

const { authenticate } = authentication.hooks

declare module '../../../declarations' {
  interface ServiceTypes {
    project: Project
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

  app.use('project-build', {
    patch: async ({ rebuild }, params) => {
      if (rebuild) {
        return await retriggerBuilderService(app)
      }
    }
  })

  app.service('project-build').hooks({
    before: {
      patch: [authenticate('jwt'), restrictUserRole('admin')]
    }
  })

  const service = app.service('project')

  service.hooks(hooks)
}
