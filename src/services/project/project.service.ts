
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Project } from './project.class'
import createModel from '../../models/project.model'
import hooks from './project.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    '/api/v1/projects': Project & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/api/v1/projects', new Project(options, app))

  const service = app.service('/api/v1/projects')

  service.hooks(hooks)
}
