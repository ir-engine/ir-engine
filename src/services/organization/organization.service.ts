// Initializes the `organization` service on path `/organization`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Organization } from './organization.class';
import createModel from '../../models/organization.model';
import hooks from './organization.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'organization': Organization & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/organization', new Organization(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('organization');

  service.hooks(hooks);
}
