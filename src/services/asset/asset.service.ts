// Initializes the `Asset` service on path `/asset`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Asset } from './asset.class'
import createModel from '../../models/asset.model'
import hooks from './asset.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'asset': Asset & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/asset', new Asset(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('asset')

  service.hooks(hooks)
}
