import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SubscriptionType } from './subscription-type.class';
import createModel from '../../models/subscription-type.model';
import hooks from './subscription-type.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'subscription-type': SubscriptionType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/subscription-type', new SubscriptionType(options, app));

  const service = app.service('subscription-type');

  service.hooks(hooks);
};
