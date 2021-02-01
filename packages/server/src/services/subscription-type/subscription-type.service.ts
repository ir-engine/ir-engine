import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SubscriptionType } from './subscription-type.class';
import createModel from '../../models/subscription-type.model';
import hooks from './subscription-type.hooks';
import subscriptionTypeDocs from './subscription-type.docs';

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
  
  const event = new SubscriptionType(options, app);
  event.docs = subscriptionTypeDocs;
  
  app.use('/subscription-type', event);

  const service = app.service('subscription-type');

  service.hooks(hooks);
};
