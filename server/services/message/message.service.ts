import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Message } from './message.class'
import createModel from '../../models/message.model'
import hooks from './message.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'message': Message & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/message', new Message(options, app))

  const service = app.service('message')

  service.hooks(hooks)
}
