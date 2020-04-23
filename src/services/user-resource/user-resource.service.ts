import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserResource } from './user-resource.class'
import createModel from '../../models/user-resource.model'
import hooks from './user-resource.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'user-resource': UserResource & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/user-resource', new UserResource(options, app))

  const service = app.service('user-resource')

  service.hooks(hooks)
}
