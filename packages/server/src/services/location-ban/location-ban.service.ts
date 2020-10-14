// Initializes the `location-ban` service on path `/location-ban`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LocationBan } from './location-ban.class';
import createModel from '../../models/location-ban.model';
import hooks from './location-ban.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'location-ban': LocationBan & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/location-ban', new LocationBan(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('location-ban');

  service.hooks(hooks);
}
