// Initializes the `collection-type` service on path `/collection-type`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { CollectionType } from './collection-type.class';
import createModel from '../../models/collection-type.model';
import hooks from './collection-type.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'collection-type': CollectionType & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/collection-type', new CollectionType(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('collection-type');

  service.hooks(hooks);
}
