// Initializes the `messages` service on path `/messages`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Messages } from './message.class'
import createModel from '../../models/message.model'
import hooks from './message.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'message': Messages & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/message', new Messages(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('message')

  service.hooks(hooks)
}
