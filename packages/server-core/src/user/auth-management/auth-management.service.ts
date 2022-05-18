import { Application } from '../../../declarations'
import { Authmanagement } from './auth-management.class'
import notifier from './auth-management.notifier'
import hooks from './auth-management.hooks'
import authManagement from 'feathers-authentication-management'

/**
 * A function which register service for auth management
 *
 * @author Vyacheslav Solovjov
 */
declare module '../../../declarations' {
  interface ServiceTypes {
    authManagement: Authmanagement
  }
}

export default (app: Application): void => {
  app.configure(authManagement(notifier(app)))
  const service = app.service('authManagement')
  service.hooks(hooks)
}
