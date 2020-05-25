import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Chatroom } from './chatroom.class'
import hooks from './chatroom.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'chatroom': Chatroom & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    paginate: app.get('paginate')
  }

  app.use('/chatroom', new Chatroom(options, app))

  const service = app.service('chatroom')

  service.hooks(hooks)
}
