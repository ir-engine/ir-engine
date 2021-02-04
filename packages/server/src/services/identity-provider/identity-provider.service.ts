import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { IdentityProvider } from './identity-provider.class';
import createModel from '../../models/identity-provider.model';
import hooks from './identity-provider.hooks';
import identyDocs from './identity-provider.docs';
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

  const event = new IdentityProvider(options, app);
  event.docs = identyDocs;

  app.use('/identity-provider', event);

  const service = app.service('identity-provider');

  service.hooks(hooks);
};
