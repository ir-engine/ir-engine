// Initializes the `magiclink` service on path `/magiclink`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Magiclink } from './magiclink.class';
import hooks from './magiclink.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'magiclink': Magiclink & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/magiclink', new Magiclink(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('magiclink');

  service.hooks(hooks);
}
