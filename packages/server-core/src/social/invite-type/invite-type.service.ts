// Initializes the `invite-type` service on path `/invite-type`
import { Application } from '../../../declarations'
import { InviteType } from './invite-type.class'
import createModel from './invite-type.model'
import hooks from './invite-type.hooks'
import inviteTypeDocs from './invite-type.docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'invite-type': InviteType
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

  const event = new InviteType(options, app)
  event.docs = inviteTypeDocs
  app.use('invite-type', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('invite-type')

  service.hooks(hooks)
}
