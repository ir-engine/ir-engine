// Initializes the `OrganizationUserRank` service on path `/organization-user-rank`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { OrganizationUserRank } from './organization-user-rank.class';
import createModel from '../../models/organization-user-rank.model';
import hooks from './organization-user-rank.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'organization-user-rank': OrganizationUserRank & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/organization-user-rank', new OrganizationUserRank(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('organization-user-rank');

  service.hooks(hooks);
}
