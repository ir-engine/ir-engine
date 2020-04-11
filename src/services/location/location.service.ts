// Initializes the `location` service on path `/location`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Location } from './location.class'
import createModel from '../../models/location.model'
import hooks from './location.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'location': Location & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/location', new Location(options, app))

  const service = app.service('location')

  service.hooks(hooks)
}
