// Initializes the `entity` service on path `/entity`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Entity } from './entity.class';
import createModel from '../../models/entity.model';
import hooks from './entity.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'entity': Entity & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/entity', new Entity(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('entity');

  service.hooks(hooks);
}
