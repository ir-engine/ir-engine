import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Subscription } from './subscription.class';
import createModel from '../../models/subscription.model';
import hooks from './subscription.hooks';
import subscription from './subscription.docs';

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

  const event = new Subscription(options, app);
  event.docs = subscription

  app.use('/subscription', event);

  const service = app.service('subscription');

  service.hooks(hooks);
};
