// Initializes the `Instances` service on path `/instances`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Instances } from './instances.class'
import createModel from '../../models/instances.model'
import hooks from './instances.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'instances': Instances & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/instances', new Instances(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('instances')

  service.hooks(hooks)
}
