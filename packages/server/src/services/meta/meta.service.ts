import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Meta } from './meta.class';
import hooks from './meta.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'meta': Meta & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {};

  app.use('/meta', new Meta(options, app));

  const service = app.service('meta');

  service.hooks(hooks);
};
