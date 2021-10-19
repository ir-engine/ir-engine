import hooks from './project.hooks'
import { Application } from '../../../declarations'
import { Project } from './project.class'
import createModel from './project.model'
import projectDocs from './project.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    project: Project
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

  const service = app.service('project')

  service.hooks(hooks)
}
