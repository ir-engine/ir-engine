import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { License } from './license.class';
import createModel from '../../models/license.model';
import hooks from './license.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'license': License & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/license', new License(options, app));

  const service = app.service('license');

  service.hooks(hooks);
};
