// Initializes the `location-instance` service on path `/location-instance`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { LocationInstance } from './location-instance.class'
import createModel from '../../models/location-instance.model'
import hooks from './location-instance.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'location-instance': LocationInstance & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/location-instance', new LocationInstance(options, app))

  const service = app.service('location-instance')

  service.hooks(hooks)
}
