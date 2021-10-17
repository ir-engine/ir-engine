import { Application } from '../../../declarations'
import { Project } from './project.class'
import projectDocs from './project.docs'
import createModel from './project.model'
import hooks from './project.hooks'
import createAssetModel from './project-asset.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    project: Project
  }
}

export default (app: Application): any => {
  createAssetModel(app)
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Project(options, app)
  event.docs = projectDocs

  app.use('scene', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('scene')

  service.hooks(hooks)
}
