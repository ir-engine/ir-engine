// Initializes the `groups` service on path `/groups`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Groups } from './groups.class'
import createModel from '../../models/groups.model'
import hooks from './groups.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'groups': Groups & ServiceAddons<any>
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/groups', new Groups(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('groups')

  service.hooks(hooks)
}
