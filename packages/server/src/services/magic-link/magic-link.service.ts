import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Magiclink } from './magic-link.class';
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

  app.use('/magic-link', new Magiclink(options, app));

  const service = app.service('magic-link');

  service.hooks(hooks);
};
