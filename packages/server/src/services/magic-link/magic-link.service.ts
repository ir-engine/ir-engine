import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Magiclink } from './magic-link.class';
import magicLinkDocs from './magic-link.docs';
import hooks from './magic-link.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'magic-link': Magiclink & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  };
  const event = new Magiclink(options, app);
  event.docs = magicLinkDocs;
  app.use('/magic-link', event);

  const service = app.service('magic-link');

  service.hooks(hooks);
};
