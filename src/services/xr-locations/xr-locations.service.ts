// Initializes the `XrLocations` service on path `/locations`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { XrLocations } from './xr-locations.class'
import createModel from '../../models/xr-locations.model'
import hooks from './xr-locations.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'locations': XrLocations & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/locations', new XrLocations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('locations')

  service.hooks(hooks)
}
