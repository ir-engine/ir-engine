// Initializes the `chatroom` service on path `/chatroom`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Chatroom } from './chatroom.class'
import hooks from './chatroom.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'chatroom': Chatroom & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/chatroom', new Chatroom(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('chatroom')

  service.hooks(hooks)
}
