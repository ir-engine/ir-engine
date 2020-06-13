import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Conversation } from './conversation.class'
import createModel from '../../models/conversation.model'
import hooks from './conversation.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'conversation': Conversation & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/conversation', new Conversation(options, app))

  const service = app.service('conversation')

  service.hooks(hooks)
}
