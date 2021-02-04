import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SeatStatus } from './seat-status.class';
import createModel from '../../models/seat-status.model';
import hooks from './seat-status.hooks';
import seatStatusDocs from './seat-status.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'seat-status': SeatStatus & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new SeatStatus(options, app);
  event.docs = seatStatusDocs;
  app.use('/seat-status', event);

  const service = app.service('seat-status');

  service.hooks(hooks);
};
