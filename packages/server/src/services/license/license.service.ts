import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { License } from './license.class';
import createModel from '../../models/license.model';
import hooks from './license.hooks';
import licenseDocs from './license.docs';

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
  const event = new License(options, app);
  event.docs = licenseDocs;
  app.use('/license', event);

  const service = app.service('license');

  service.hooks(hooks);
};
