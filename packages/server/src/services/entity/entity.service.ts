import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Entity } from './entity.class';
import createModel from '../../models/entity.model';
import hooks from './entity.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'entity': Entity & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  // Register model to

  app.use('/entity', new Entity(options, app));

  const service = app.service('entity');

  service.hooks(hooks);
};
