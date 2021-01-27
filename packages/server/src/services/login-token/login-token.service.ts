// Initializes the `login-token` service on path `/login-token`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LoginToken } from './login-token.class';
import createModel from '../../models/login-token.model';
import hooks from './login-token.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'login-token': LoginToken & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/login-token', new LoginToken(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('login-token');

  service.hooks(hooks);
};
