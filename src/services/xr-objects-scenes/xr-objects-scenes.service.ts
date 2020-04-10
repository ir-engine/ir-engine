// Initializes the `xr-objects-scenes` service on path `/xr-objects-scenes`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { XrObjectsScenes } from './xr-objects-scenes.class';
import createModel from '../../models/xr-objects-scenes.model';
import hooks from './xr-objects-scenes.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'xr-objects-scenes': XrObjectsScenes & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/xr-objects-scenes', new XrObjectsScenes(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('xr-objects-scenes');

  service.hooks(hooks);
}
