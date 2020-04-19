// Initializes the `resource-type` service on path `/resource-type`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ResourceType } from './resource-type.class';
import createModel from '../../models/resource-type.model';
import hooks from './resource-type.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'resource-type': ResourceType & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/resource-type', new ResourceType(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('resource-type');

  service.hooks(hooks);
}
