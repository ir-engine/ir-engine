// Initializes the `location-type` service on path `/location-type`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LocationType } from './location-type.class';
import createModel from '../../models/location-type.model';
import hooks from './location-type.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'location-type': LocationType & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/location-type', new LocationType(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('location-type');

  service.hooks(hooks);
}
