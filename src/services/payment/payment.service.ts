// Initializes the `payment` service on path `/payment`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Payment } from './payment.class'
import createModel from '../../models/payment.model'
import hooks from './payment.hooks'
import './../../util/payments-utility'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    payment: Payment & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/payment', new Payment(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('payment')

  service.hooks(hooks)
}
