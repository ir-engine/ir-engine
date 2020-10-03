import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Instance } from './instance.class';
import createModel from '../../models/instance.model';
import hooks from './instance.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'instance': Instance & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/instance', new Instance(options, app));

  const service = app.service('instance');

  service.hooks(hooks);
};
