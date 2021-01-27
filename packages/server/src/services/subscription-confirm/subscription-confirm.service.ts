import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SubscriptionConfirm } from './subscription-confirm.class';
import hooks from './subscription-confirm.hooks';
import config from '../../config';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'subscription-confirm': SubscriptionConfirm & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    paginate: app.get('paginate')
  };

  app.use('/subscription-confirm', new SubscriptionConfirm(options, app), (req, res) => {
    res.redirect(config.client.url);
  });

  const service = app.service('subscription-confirm');

  service.hooks(hooks);
};
