// Initializes the `public-video` service on path `/public-video`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PublicVideo } from './public-video.class';
import createModel from '../../models/public-video.model';
import hooks from './public-video.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'public-video': PublicVideo & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['create']
  };

  // Initialize our service with any options it requires
  app.use('/public-video', new PublicVideo(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('public-video');

  service.hooks(hooks);
}
