// Initializes the `ProjectAsset` service on path `/project-asset`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ProjectAsset } from './project-asset.class'
import createModel from '../../models/project-asset.model'
import hooks from './project-asset.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'project-asset': ProjectAsset & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/project-asset', new ProjectAsset(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('project-asset')

  service.hooks(hooks)
}
