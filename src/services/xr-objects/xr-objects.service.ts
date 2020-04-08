// Initializes the `XrObjects` service on path `/objects`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { XrObjects } from './xr-objects.class'
import createModel from '../../models/xr-objects.model'
import hooks from './xr-objects.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'objects': XrObjects & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/objects', new XrObjects(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('objects')

  service.hooks(hooks)
}
