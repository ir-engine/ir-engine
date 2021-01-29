import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Entity } from './entity.class';
import createModel from '../../models/entity.model';
import hooks from './entity.hooks';
import entityDocs from './entity.docs';

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
   const event = new Entity(options, app);
   event.docs = entityDocs;
  app.use('/entity', event);

  const service = app.service('entity');

  service.hooks(hooks);
};
