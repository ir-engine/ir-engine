import { Application } from '../../../declarations'
import { ProjectPermission } from './project-permission.class'
import projectPermissionDocs from './project-permission.docs'
import hooks from './project-permission.hooks'
import createModel from './project-permission.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'project-permission': ProjectPermission
  }
  interface Models {
    'project-permission': ReturnType<typeof createModel>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const projectPermissionClass = new ProjectPermission(options, app)
  projectPermissionClass.docs = projectPermissionDocs

  app.use('project-permission', projectPermissionClass)

  const service = app.service('project-permission')

  service.hooks(hooks)
}
