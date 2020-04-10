// Initializes the `user` service on path `/user`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { User } from './user.class'
import createModel from '../../models/user.model'
import hooks from './user.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'user': User & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/user', new User(options, app))

  const service = app.service('user')

  service.hooks(hooks)
}
