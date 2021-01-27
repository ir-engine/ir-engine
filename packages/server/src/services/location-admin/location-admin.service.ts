// Initializes the `location-admin` service on path `/location-admin`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LocationAdmin } from './location-admin.class';
import createModel from '../../models/location-admin.model';
import hooks from './location-admin.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'location-admin': LocationAdmin & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/location-admin', new LocationAdmin(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('location-admin');

  service.hooks(hooks);
}
