// Initializes the `license` service on path `/license`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { License } from './license.class';
import createModel from '../../models/license.model';
import hooks from './license.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'license': License & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/license', new License(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('license');

  service.hooks(hooks);
}
