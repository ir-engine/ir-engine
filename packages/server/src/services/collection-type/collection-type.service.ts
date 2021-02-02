import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { CollectionType } from './collection-type.class';
import createModel from '../../models/collection-type.model';
import hooks from './collection-type.hooks';
import collectionTypeDocs from './collection-type.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'collection-type': CollectionType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };
  const event = new CollectionType(options, app);
  event.docs = collectionTypeDocs;
  app.use('/collection-type', event);

  const service = app.service('collection-type');

  service.hooks(hooks);
};
