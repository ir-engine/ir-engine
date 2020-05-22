// Initializes the `subscription-confirm` service on path `/subscription-confirm`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { SubscriptionConfirm } from './subscription-confirm.class'
import hooks from './subscription-confirm.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'subscription-confirm': SubscriptionConfirm & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/subscription-confirm', new SubscriptionConfirm(options, app), (req, res) => {
    res.redirect(process.env.APP_HOST as string)
  })

  // Get our initialized service so that we can register hooks
  const service = app.service('subscription-confirm')

  service.hooks(hooks)
}
