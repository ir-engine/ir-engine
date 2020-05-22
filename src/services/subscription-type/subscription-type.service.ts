// Initializes the `subscription-type` service on path `/subscription-type`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { SubscriptionType } from './subscription-type.class'
import createModel from '../../models/subscription-type.model'
import hooks from './subscription-type.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'subscription-type': SubscriptionType & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/subscription-type', new SubscriptionType(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('subscription-type')

  service.hooks(hooks)
}
