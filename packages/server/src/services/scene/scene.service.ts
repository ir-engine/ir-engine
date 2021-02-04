import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Scene } from './scene.class';
import createModel from '../../models/scene.model';
import hooks from './scene.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'scene': Scene & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/scene', new Scene(options, app));

  const service = app.service('scene');

  service.hooks(hooks);
};
