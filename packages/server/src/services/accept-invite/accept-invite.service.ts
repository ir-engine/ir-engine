// Initializes the `accept-invite` service on path `/accept-invite`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { AcceptInvite } from './accept-invite.class';
import hooks from './accept-invite.hooks';
import config from '../../config';
import acceptInviteDocs from './accept-invite.docs';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'a-i': AcceptInvite & ServiceAddons<any>;
  }
}

function redirect (req, res, next): any {
  console.log('REDIRECTING');
  return res.redirect(config.client.url);
}

export default (app: Application): any => {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const event = new AcceptInvite(options, app);
  event.docs = acceptInviteDocs;
  app.use('/a-i', event, redirect);

  // Get our initialized service so that we can register hooks
  const service = app.service('a-i');

  service.hooks(hooks);
};
