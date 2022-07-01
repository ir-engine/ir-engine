import { Application } from '../../../declarations'
import { ProjectPermissionType } from './project-permission-type.class'
import projectPermissionTypeDocs from './project-permission-type.docs'
import hooks from './project-permission-type.hooks'
import createModel from './project-permission-type.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'project-permission-type': ProjectPermissionType
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ProjectPermissionType(options, app)
  event.docs = projectPermissionTypeDocs
  app.use('project-permission-type', event)

  const service = app.service('project-permission-type')
  service.hooks(hooks)
}
