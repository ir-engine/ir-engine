// Initializes the `realtime-store` service on path `/realtime-store`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { RealtimeStore } from './realtime-store.class';
import hooks from './realtime-store.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'realtime-store': RealtimeStore & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/realtime-store', new RealtimeStore(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('realtime-store');

  service.hooks(hooks);

  service.store = {
    component: {},
    entity: {},
    user: {}
  }
}
