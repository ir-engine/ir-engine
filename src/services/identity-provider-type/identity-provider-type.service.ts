import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { IdentityProviderType } from './identity-provider-type.class'
import createModel from '../../models/identity-provider-type.model'
import hooks from './identity-provider-type.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'identity-provider-type': IdentityProviderType & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/identity-provider-type', new IdentityProviderType(options, app))

  const service = app.service('identity-provider-type')

  service.hooks(hooks)
}
