import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Sms } from './sms.class';
import smsDocs from './sms.docs';
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

  const event = new Sms(options, app);
  event.docs = smsDocs;

  app.use('/sms', event);

  const service = app.service('sms');

  service.hooks(hooks);
};
