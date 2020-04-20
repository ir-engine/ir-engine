// Initializes the `attribution` service on path `/attribution`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Attribution } from './attribution.class';
import createModel from '../../models/attribution.model';
import hooks from './attribution.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'attribution': Attribution & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/attribution', new Attribution(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('attribution');

  service.hooks(hooks);
}
