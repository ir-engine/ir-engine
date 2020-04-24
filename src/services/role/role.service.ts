import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Role } from './role.class'
import createModel from '../../models/role.model'
import hooks from './role.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'role': Role & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/role', new Role(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('role')

  service.hooks(hooks)
}
