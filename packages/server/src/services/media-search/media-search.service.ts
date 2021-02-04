import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { MediaSearch } from './media-search.class';
import hooks from './media-search.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'media-search': MediaSearch & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate')
  };

  app.use('/media-search', new MediaSearch(options, app));

  const service = app.service('media-search');

  service.hooks(hooks);
};
