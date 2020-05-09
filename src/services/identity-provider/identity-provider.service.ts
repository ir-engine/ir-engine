// Initializes the `identity-provider` service on path `/identity-provider`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { IdentityProvider } from './identity-provider.class'
import createModel from '../../models/identity-provider.model'
import hooks from './identity-provider.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'identity-provider': IdentityProvider & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/identity-provider', new IdentityProvider(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('identity-provider')

  service.hooks(hooks)
}
