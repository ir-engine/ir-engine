// Initializes the `instance-authorized-user` service on path `/instance-authorized-user`
import { Application } from '../../../declarations'
import { InstanceAuthorizedUser } from './instance-authorized-user.class'
import instanceAuthorizedUserDocs from './instance-authorized-user.docs'
import hooks from './instance-authorized-user.hooks'
import createModel from './instance-authorized-user.model'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'instance-authorized-user': InstanceAuthorizedUser
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new InstanceAuthorizedUser(options, app)
  event.docs = instanceAuthorizedUserDocs
  app.use('instance-authorized-user', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('instance-authorized-user')

  service.hooks(hooks)
}
