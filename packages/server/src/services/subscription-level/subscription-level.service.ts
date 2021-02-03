import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SubscriptionLevel } from './subscription-level.class';
import createModel from '../../models/subscription-level.model';
import hooks from './subscription-level.hooks';
import subscriptionLevelDocs from './subscription-level.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'subscription-level': SubscriptionLevel & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };
  
  const event = new SubscriptionLevel(options, app);
  event.docs = subscriptionLevelDocs;
  app.use('/subscription-level', event);

  const service = app.service('subscription-level');

  service.hooks(hooks);
};
