import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Channel } from './channel.class'
import createModel from '../../models/channel.model'
import hooks from './channel.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'channel': Channel & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/channel', new Channel(options, app))

  const service = app.service('channel')

  service.hooks(hooks)
}
