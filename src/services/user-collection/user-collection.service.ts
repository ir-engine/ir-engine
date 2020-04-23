// Initializes the `user-collection` service on path `/user-collection`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserCollection } from './user-collection.class';
import createModel from '../../models/user-collection.model';
import hooks from './user-collection.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'user-collection': UserCollection & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/user-collection', new UserCollection(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-collection');

  service.hooks(hooks);
}
