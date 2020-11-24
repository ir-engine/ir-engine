import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { StaticResource } from './static-resource.class';
import createModel from '../../models/static-resource.model';
import hooks from './static-resource.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'static-resource': StaticResource & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/static-resource', new StaticResource(options, app));

  const service = app.service('static-resource');

  service.hooks(hooks);
};
