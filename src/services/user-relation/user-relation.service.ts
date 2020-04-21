// Initializes the `user-relation` service on path `/user-relation`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserRelation } from './user-relation.class'
import createModel from '../../models/user-relation.model'
import hooks from './user-relation.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'user-relation': UserRelation & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/user-relation', new UserRelation(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('user-relation')

  service.hooks(hooks)
}
