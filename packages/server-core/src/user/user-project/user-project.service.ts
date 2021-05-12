import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { UserProject } from './user-project.class';
import createModel from './user-project.model';
import hooks from './user-project.hooks';

declare module '../../../declarations' {
  interface ServiceTypes {
    'user-project': UserProject & ServiceAddons<any>;
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
   * @author KIMENYI Kevin
   */
  const event = new UserProject(options, app);
  app.use('/user-project', event);

  const service = app.service('user-project');

  service.hooks(hooks);
};
