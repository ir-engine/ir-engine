import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Component } from './component.class';
import createModel from '../../models/component.model';
import hooks from './component.hooks';

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

  app.use('/component', new Component(options, app));

  const service = app.service('component');

  service.hooks(hooks);
};
