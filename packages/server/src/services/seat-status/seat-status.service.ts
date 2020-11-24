import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SeatStatus } from './seat-status.class';
import createModel from '../../models/seat-status.model';
import hooks from './seat-status.hooks';

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

  app.use('/seat-status', new SeatStatus(options, app));

  const service = app.service('seat-status');

  service.hooks(hooks);
};
