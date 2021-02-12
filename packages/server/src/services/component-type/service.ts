import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ComponentType } from './component-type.class';
import createModel from '../../models/component-type.model';
import hooks from './component-type.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'component-type': ComponentType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/component-type', new ComponentType(options, app));

  const service = app.service('component-type');

  service.hooks(hooks);
};
