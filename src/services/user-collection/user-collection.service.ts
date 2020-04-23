import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserCollection } from './user-collection.class'
import createModel from '../../models/user-collection.model'
import hooks from './user-collection.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'user-collection': UserCollection & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/user-collection', new UserCollection(options, app))

  const service = app.service('user-collection')

  service.hooks(hooks)
}
