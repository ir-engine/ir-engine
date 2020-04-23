// Initializes the `GroupUser` service on path `/group-user`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { GroupUser } from './group-user.class'
import createModel from '../../models/group-user.model'
import hooks from './group-user.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'group-user': GroupUser & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/group-user', new GroupUser(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('group-user')

  service.hooks(hooks)
}
