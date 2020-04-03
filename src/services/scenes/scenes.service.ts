// Initializes the `scenes` service on path `/scenes`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Scenes } from './scenes.class';
import createModel from '../../models/scenes.model';
import hooks from './scenes.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'scenes': Scenes & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/scenes', new Scenes(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('scenes');

  service.hooks(hooks);
}
