import { Application } from '../../../declarations'
import { ChannelType } from './channel-type.class'
import channelTypeDocs from './channel-type.docs'
import hooks from './channel-type.hooks'
import createModel from './channel-type.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'channel-type': ChannelType
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new ChannelType(options, app)
  event.docs = channelTypeDocs

  app.use('channel-type', event)

  const service = app.service('channel-type')

  service.hooks(hooks)
}
