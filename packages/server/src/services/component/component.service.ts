import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Component } from './component.class';
import createModel from '../../models/component.model';
import hooks from './component.hooks';
import componentDocs from './component.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'component': Component & ServiceAddons<any>;
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
  const event = new Component(options, app);
  event.docs = componentDocs;
  app.use('/component', event);

  const service = app.service('component');

  service.hooks(hooks);
};
