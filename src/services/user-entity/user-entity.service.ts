// Initializes the `user-entity` service on path `/user-entity`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserEntity } from './user-entity.class'
import createModel from '../../models/user-entity.model'
import hooks from './user-entity.hooks'

// Add this service to the service type index
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

  // Initialize our service with any options it requires
  app.use('/user-entity', new UserEntity(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('user-entity')

  service.hooks(hooks)
}
