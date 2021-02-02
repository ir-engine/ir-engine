import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Seat } from './seat.class';
import createModel from '../../models/seat.model';
import hooks from './seat.hooks';
import seatDocs from './seat.docs';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'seat': Seat & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new Seat(options, app);
  event.docs = seatDocs;
  app.use('/seat', event);

  const service = app.service('seat');

  service.hooks(hooks);
};
