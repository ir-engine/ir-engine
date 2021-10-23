import { Application } from '../../../declarations'
import { UserRole } from './user-role.class'
import createModel from './user-role.model'
import hooks from './user-role.hooks'
import userRoleDocs from './user-role.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'user-role': UserRole
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
  const event = new UserRole(options, app)
  event.docs = userRoleDocs
  app.use('user-role', event)

  const service = app.service('user-role')

  service.hooks(hooks)
}
