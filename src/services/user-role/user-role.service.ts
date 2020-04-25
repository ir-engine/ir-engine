import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Role } from './user-role.class'
import createModel from '../../models/user-role.model'
import hooks from './user-role.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'user-role': Role & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/user-role', new Role(options, app))

  const service = app.service('user-role')

  service.hooks(hooks)
}
