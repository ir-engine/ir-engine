// Initializes the `seat-status` service on path `/seat-status`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SeatStatus } from './seat-status.class';
import createModel from '../../models/seat-status.model';
import hooks from './seat-status.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'seat-status': SeatStatus & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/seat-status', new SeatStatus(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('seat-status');

  service.hooks(hooks);
}
