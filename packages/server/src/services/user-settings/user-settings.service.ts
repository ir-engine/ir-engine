import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { UserSettings } from './user-settings.class';
import createModel from '../../models/user-settings.model';
import hooks from './user-settings.hooks';
import userSettingsDocs from './user-settings.docs';

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
  /**
   * Initialize our service with any options it requires and docs 
   * 
   * @author Vyacheslav Solovjov
   */
  const event= new UserSettings(options, app);
  event.docs = userSettingsDocs;
  app.use('/user-settings', event);

  const service = app.service('user-settings');

  service.hooks(hooks);
};
