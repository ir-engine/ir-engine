import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Location } from './location.class';
import createModel from '../../models/location.model';
import hooks from './location.hooks';
import locationDocs from './location.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'location': Location & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new Location(options, app);
  event.docs = locationDocs;

  app.use('/location', event);

  const service = app.service('location');

  service.hooks(hooks);
};
