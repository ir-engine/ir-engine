import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ConversationType } from './conversation-type.class'
import createModel from '../../models/conversation-type.model'
import hooks from './conversation-type.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'conversation-type': ConversationType & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/conversation-type', new ConversationType(options, app))

  const service = app.service('conversation-type')

  service.hooks(hooks)
}
