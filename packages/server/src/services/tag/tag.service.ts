import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Tag } from './tag.class';
import createModel from '../../models/tag.model';
import hooks from './tag.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'tag': Tag & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  app.use('/tag', new Tag(options, app));

  const service = app.service('tag');

  service.hooks(hooks);
};
