import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Collection } from './collection.class';
import createModel from '../../models/collection.model';
import hooks from './collection.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'collection': Collection & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/collection', new Collection(options, app));

  const service = app.service('collection');

  service.hooks(hooks);
};
