// Initializes the `OrganizationUser` service on path `/organization-user`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { OrganizationUser } from './organization-user.class';
import createModel from '../../models/organization-user.model';
import hooks from './organization-user.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'organization-user': OrganizationUser & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/organization-user', new OrganizationUser(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('organization-user');

  service.hooks(hooks);
}
