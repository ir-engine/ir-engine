// Initializes the `subscription` service on path `/subscription`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Subscription } from './subscription.class';
import createModel from '../../models/subscription.model';
import hooks from './subscription.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'subscription': Subscription & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/subscription', new Subscription(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('subscription');

  service.hooks(hooks);
}
