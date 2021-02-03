import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Attribution } from './attribution.class';
import createModel from '../../models/attribution.model';
import hooks from './attribution.hooks';
import attributionDocs from './attribution.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'attribution': Attribution & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new Attribution(options, app);
  event.docs = attributionDocs;

  app.use('/attribution', event);

  const service = app.service('attribution');

  service.hooks(hooks);
};
