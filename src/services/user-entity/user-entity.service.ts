import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserEntity } from './user-entity.class'
import createModel from '../../models/user-entity.model'
import hooks from './user-entity.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'user-entity': UserEntity & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/user-entity', new UserEntity(options, app))

  const service = app.service('user-entity')

  service.hooks(hooks)
}
