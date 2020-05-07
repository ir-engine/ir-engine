// Initializes the `user-settings` service on path `/user-settings`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserSettings } from './user-settings.class';
import createModel from '../../models/user.model'
import hooks from './user-settings.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'user-settings': UserSettings & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/user-settings', new UserSettings(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-settings');

  service.hooks(hooks);
}
