// Initializes the `Meta` service on path `/api/v1/meta`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Meta } from './meta.class'
import hooks from './meta.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'api/v1/meta': Meta & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {}

  // Initialize our service with any options it requires
  app.use('/api/v1/meta', new Meta(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('api/v1/meta')

  service.hooks(hooks)
}
