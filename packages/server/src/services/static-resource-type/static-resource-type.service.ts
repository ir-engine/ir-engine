import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { StaticResourceType } from './static-resource-type.class';
import createModel from '../../models/static-resource-type.model';
import hooks from './static-resource-type.hooks';

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

  app.use('/static-resource-type', new StaticResourceType(options, app));

  const service = app.service('static-resource-type');

  service.hooks(hooks);
};
