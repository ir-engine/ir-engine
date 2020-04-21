// Initializes the `user-resource` service on path `/user-resource`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserResource } from './user-resource.class'
import createModel from '../../models/user-resource.model'
import hooks from './user-resource.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'user-resource': UserResource & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/user-resource', new UserResource(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('user-resource')

  service.hooks(hooks)
}
