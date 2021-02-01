import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { StaticResource } from './static-resource.class';
import createModel from '../../models/static-resource.model';
import hooks from './static-resource.hooks';
import staticResourceDocs from './static-resource.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'static-resource': StaticResource & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new StaticResource(options, app);
  event.docs = staticResourceDocs; 

  app.use('/static-resource', event);

  const service = app.service('static-resource');

  service.hooks(hooks);
};
