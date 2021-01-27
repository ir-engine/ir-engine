// Initializes the `resolve-media` service on path `/resolve-media`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ResolveMedia } from './resolve-media.class';
import hooks from './resolve-media.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'resolve-media': ResolveMedia & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/resolve-media', new ResolveMedia(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('resolve-media');

  service.hooks(hooks);
};
