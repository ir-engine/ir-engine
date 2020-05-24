// Initializes the `seat` service on path `/seat`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Seat } from './seat.class'
import createModel from '../../models/seat.model'
import hooks from './seat.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'seat': Seat & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/seat', new Seat(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('seat')

  service.hooks(hooks)
}
