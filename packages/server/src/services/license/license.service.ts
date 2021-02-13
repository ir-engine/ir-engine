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
  /**
   * Initialize our service with any options it requires and docs 
   * 
   * @author Vyacheslav Solovjov
   */
  const event = new License(options, app);
  event.docs = licenseDocs;
  app.use('/license', event);

  /**
   * Get our initialized service so that we can register hooks
   * 
   * @author Vyacheslav Solovjov
   */
  const service = app.service('license');

  service.hooks(hooks);
};
