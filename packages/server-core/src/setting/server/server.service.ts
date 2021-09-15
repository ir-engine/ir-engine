import { ServiceAddons } from '@feathersjs/feathers'
import hooks from './server.hooks'
import { Application } from '../../../declarations'
import { Server } from './server.class'
import createModel from './server.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    server: Server & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Server(options, app)
  app.use('/server', event)

  const service = app.service('server')
  service.hooks(hooks as any)
}
