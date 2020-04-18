// Initializes the `sms` service on path `/sms`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Sms } from './sms.class'
import hooks from './sms.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'sms': Sms & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/sms', new Sms(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('sms')

  service.hooks(hooks)
}
