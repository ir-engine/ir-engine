import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Location } from './location.class';
import createModel from '../../models/location.model';
import hooks from './location.hooks';

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

  app.use('/location', new Location(options, app));

  const service = app.service('location');

  service.hooks(hooks);
};
