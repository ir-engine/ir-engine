// Initializes the `message-status` service on path `/message-status`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { MessageStatus } from './message-status.class'
import createModel from '../../models/message-status.model'
import hooks from './message-status.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'message-status': MessageStatus & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/message-status', new MessageStatus(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('message-status')

  service.hooks(hooks)
}
