// Initializes the `invite` service on path `/invite`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Invite } from './invite.class'
import createModel from '../../models/invite.model'
import hooks from './invite.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'invite': Invite & ServiceAddons<any>
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/invite', new Invite(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('invite')

  service.hooks(hooks)
}
