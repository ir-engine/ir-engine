// Initializes the `XrLocationInstances` service on path `/instances`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { XrLocationInstances } from './xr-location-instances.class'
import createModel from '../../models/xr-location-instances.model'
import hooks from './xr-location-instances.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'instances': XrLocationInstances & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/instances', new XrLocationInstances(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('instances')

  service.hooks(hooks)
}
