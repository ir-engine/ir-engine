// Initializes the `AccessControlScope` service on path `/access-control-scope`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { AccessControlScope } from './access-control-scope.class';
import createModel from '../../models/access-control-scope.model';
import hooks from './access-control-scope.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'access-control-scope': AccessControlScope & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/access-control-scope', new AccessControlScope(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('access-control-scope');

  service.hooks(hooks);
}
