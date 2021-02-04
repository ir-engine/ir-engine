import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { StaticResourceType } from './static-resource-type.class';
import createModel from '../../models/static-resource-type.model';
import hooks from './static-resource-type.hooks';
import staticResourceTypeDocs from './static-resource-type.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'static-resource-type': StaticResourceType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new StaticResourceType(options, app);
  event.docs = staticResourceTypeDocs;
  app.use('/static-resource-type', event);

  const service = app.service('static-resource-type');

  service.hooks(hooks);
};
