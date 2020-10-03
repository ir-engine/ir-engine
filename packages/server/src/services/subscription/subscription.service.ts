import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Subscription } from './subscription.class';
import createModel from '../../models/subscription.model';
import hooks from './subscription.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    subscription: Subscription & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  app.use('/subscription', new Subscription(options, app));

  const service = app.service('subscription');

  service.hooks(hooks);
};
