// Initializes the `login-token` service on path `/login-token`
import { Application } from '../../../declarations'
import { LoginToken } from './login-token.class'
import loginTokenDocs from './login-token.docs'
import hooks from './login-token.hooks'
import createModel from './login-token.model'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'login-token': LoginToken
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new LoginToken(options, app)
  event.docs = loginTokenDocs
  app.use('login-token', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('login-token')

  service.hooks(hooks)
}
