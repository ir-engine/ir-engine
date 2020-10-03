import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserRelationshipType } from './user-relationship-type.class';
import createModel from '../../models/user-relationship-type.model';
import hooks from './user-relationship-type.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'user-relationship-type': UserRelationshipType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/user-relationship-type', new UserRelationshipType(options, app));

  const service = app.service('user-relationship-type');

  service.hooks(hooks);
};
