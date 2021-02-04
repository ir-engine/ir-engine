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

  /**
   * Initialize our service with any options it requires and docs 
   * 
   * @author Vyacheslav Solovjov
   */
   const event = new Entity(options, app);
   event.docs = entityDocs;
  app.use('/entity', event);

  const service = app.service('entity');

  service.hooks(hooks);
};
