import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Sms } from './sms.class';
import hooks from './sms.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'sms': Sms & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/sms', new Sms(options, app));

  const service = app.service('sms');

  service.hooks(hooks);
};
