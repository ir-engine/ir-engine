// Initializes the `location-settings` service on path `/location-settings`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LocationSettings } from './location-settings.class';
import createModel from '../../models/location-settings.model';
import hooks from './location-settings.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'location-settings': LocationSettings & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/location-settings', new LocationSettings(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('location-settings');

  service.hooks(hooks);
}
