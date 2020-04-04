// Initializes the `objects` service on path `/objects`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Objects } from './objects.class'
import createModel from '../../models/objects.model'
import hooks from './objects.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'objects': Objects & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/objects', new Objects(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('objects')

  service.hooks(hooks)
}
