// Initializes the `entity-type` service on path `/entity-type`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { EntityType } from './entity-type.class';
import createModel from '../../models/entity-type.model';
import hooks from './entity-type.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'entity-type': EntityType & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/entity-type', new EntityType(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('entity-type');

  service.hooks(hooks);
}
