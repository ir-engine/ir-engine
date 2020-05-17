
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Project } from './project.class'
import createModel from '../../models/project.model'
import hooks from './project.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'projects': Project & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/projects', new Project(options, app))

  const service = app.service('projects')

  service.hooks(hooks)
}
