import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Meta } from './meta.class';
import metaDocs from './meta.docs';
import hooks from './meta.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'meta': Meta & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {};

  const event = new Meta(options, app);
  event.docs = metaDocs;

  app.use('/meta', event);

  const service = app.service('meta');

  service.hooks(hooks);
};
