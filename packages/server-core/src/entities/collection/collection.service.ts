import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Collection } from './collection.class';
import createModel from '../../models/collection.model';
import hooks from './collection.hooks';
import collectionDocs from './collection.docs';

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

  /**
   * Initialize our service with any options it requires and docs 
   * 
   * @author Vyacheslav Solovjov
   */
  const event = new Collection(options, app);
  event.docs = collectionDocs;

  app.use('/collection', event);

  const service = app.service('collection');

  service.hooks(hooks);
};
