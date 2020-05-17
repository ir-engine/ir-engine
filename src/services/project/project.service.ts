
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Project } from './project.class'
import createModel from '../../models/project.model'
import hooks from './project.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
<<<<<<< HEAD
    '/api/v1/projects': Project & ServiceAddons<any>
=======
    'projects': Project & ServiceAddons<any>
>>>>>>> Rename Project Endpoint to Projects for making it compatible with spoke
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

<<<<<<< HEAD
  app.use('/api/v1/projects', new Project(options, app))

  const service = app.service('/api/v1/projects')
=======
  app.use('/projects', new Project(options, app))

  const service = app.service('projects')
>>>>>>> Rename Project Endpoint to Projects for making it compatible with spoke

  service.hooks(hooks)
}
