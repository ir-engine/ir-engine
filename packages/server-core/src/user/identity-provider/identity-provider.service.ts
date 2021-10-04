import { Application } from '../../../declarations'
import { IdentityProvider } from './identity-provider.class'
import createModel from './identity-provider.model'
import hooks from './identity-provider.hooks'
import identyDocs from './identity-provider.docs'
declare module '../../../declarations' {
  interface ServiceTypes {
    'identity-provider': IdentityProvider
  }
}

/**
 * Initialize our service with any options it requires and docs
 *
 * @author Vyacheslav Solovjov
 */
export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new IdentityProvider(options, app)
  event.docs = identyDocs

  app.use('identity-provider', event)

  const service = app.service('identity-provider')

  service.hooks(hooks)
}
