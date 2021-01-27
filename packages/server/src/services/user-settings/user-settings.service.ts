import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserSettings } from './user-settings.class';
import createModel from '../../models/user-settings.model';
import hooks from './user-settings.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'user-settings': UserSettings & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  app.use('/user-settings', new UserSettings(options, app));

  const service = app.service('user-settings');

  service.hooks(hooks);
};
