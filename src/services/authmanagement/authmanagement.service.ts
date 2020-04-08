// Initializes the `authmanagement` service on path `/authmanagement`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Authmanagement } from './authmanagement.class';
import notifier from './notifier';
import hooks from './authmanagement.hooks';

const authManagement = require('feathers-authentication-management');

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'authManagement': Authmanagement & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  app.configure(authManagement(notifier(app)));

  // Get our initialized service so that we can register hooks
  const service = app.service('authManagement');
  service.hooks(hooks);
}
