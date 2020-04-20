// Initializes the `image` service on path `/image`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Image } from './image.class';
import createModel from '../../models/image.model';
import hooks from './image.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'image': Image & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/image', new Image(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('image');

  service.hooks(hooks);
}
