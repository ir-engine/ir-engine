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

  app.use('/message-status', new MessageStatus(options, app))

  const service = app.service('message-status')

  service.hooks(hooks)
}
