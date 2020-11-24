import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { IdentityProvider } from './identity-provider.class';
import createModel from '../../models/identity-provider.model';
import hooks from './identity-provider.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'identity-provider': IdentityProvider & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/identity-provider', new IdentityProvider(options, app));

  const service = app.service('identity-provider');

  service.hooks(hooks);
};
