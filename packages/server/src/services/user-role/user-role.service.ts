import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserRole } from './user-role.class';
import createModel from '../../models/user-role.model';
import hooks from './user-role.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'user-role': UserRole & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/user-role', new UserRole(options, app));

  const service = app.service('user-role');

  service.hooks(hooks);
};
