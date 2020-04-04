// Initializes the `locations` service on path `/locations`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Locations } from './locations.class'
import hooks from './locations.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'locations': Locations & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/locations', new Locations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('locations')

  service.hooks(hooks)
}
