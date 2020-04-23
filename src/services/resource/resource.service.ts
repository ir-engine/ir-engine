// Initializes the `resource` service on path `/resource`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Resource } from './resource.class'
import createModel from '../../models/resource.model'
import hooks from './resource.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'resource': Resource & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['remove']
  }

  // Initialize our service with any options it requires
  app.use('/resource', new Resource(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('resource')

  service.hooks(hooks)
}
