import { Application } from '@xrengine/server-core/declarations'

import { RoomInstance } from './room-instance.class'
import hooks from './room-instance.hooks'
import createModel from './room-instance.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'room-instance': RoomInstance
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new RoomInstance(options, app)
  app.use('room-instance', event)

  const service = app.service('room-instance')
  service.hooks(hooks)
}
