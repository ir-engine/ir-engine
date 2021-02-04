// Initializes the `accept-invite` service on path `/accept-invite`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { AcceptInvite } from './accept-invite.class';
import hooks from './accept-invite.hooks';
import config from '../../config';
import acceptInviteDocs from './accept-invite.docs';


/**
 * accept invite service 
 */
declare module '../../declarations' {
  interface ServiceTypes {
    'a-i': AcceptInvite & ServiceAddons<any>;
  }
}

/**
 * A function which returns url to the client 
 * 
 * @param req 
 * @param res response to the client 
 * @param next 
 * @returns redirect url to the client 
 * @author Vyacheslav Solovjov
 */

function redirect (req, res, next): any {
  console.log('REDIRECTING');
  return res.redirect(config.client.url);
}

export default (app: Application): any => {
  const options = {
    paginate: app.get('paginate')
  };

  
  /**
   * Initialize our service with any options it requires 
   * @author  Vyacheslav Solovjov
   */
  const event = new AcceptInvite(options, app);
  event.docs = acceptInviteDocs;
  app.use('/a-i', event, redirect);

  /**
   * Get our initialized service so that we can register hooks
   * @author Vyacheslav Solovjov
   */
  const service = app.service('a-i');

  service.hooks(hooks);
};
