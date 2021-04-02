import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ComponentType } from './component-type.class';
import createModel from '../../models/component-type.model';
import hooks from './component-type.hooks';
import componentTypeDocs from './component-type.docs';

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
  
  /**
   * Initialize our service with any options it requires and docs 
   * 
   * @author Vyacheslav Solovjov
   */

  const event = new ComponentType(options, app);
  event.docs = componentTypeDocs;
  
  app.use('/component-type', event);

  const service = app.service('component-type');

  service.hooks(hooks);
};
