import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { EntityType } from './entity-type.class';
import createModel from '../../models/entity-type.model';
import hooks from './entity-type.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'entity-type': EntityType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/entity-type', new EntityType(options, app));

  const service = app.service('entity-type');

  service.hooks(hooks);
};
