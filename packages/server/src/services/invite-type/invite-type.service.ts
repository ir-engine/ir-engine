// Initializes the `invite-type` service on path `/invite-type`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { InviteType } from './invite-type.class';
import createModel from '../../models/invite-type.model';
import hooks from './invite-type.hooks';
import inviteTypeDocs from './invite-type.docs';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'invite-type': InviteType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };
  
  const event = new InviteType(options, app);
  event.docs = inviteTypeDocs;
  // Initialize our service with any options it requires
  app.use('/invite-type', event);

  // Get our initialized service so that we can register hooks
  const service = app.service('invite-type');

  service.hooks(hooks);
};
