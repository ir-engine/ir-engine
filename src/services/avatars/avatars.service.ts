// Initializes the `avatars` service on path `/avatars`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Avatars } from './avatars.class';
import createModel from '../../models/avatars.model';
import hooks from './avatars.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'avatars': Avatars & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/avatars', new Avatars(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('avatars');

  service.hooks(hooks);
}
