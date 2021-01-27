import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SceneListing } from './scene-listing.class';
import createModel from '../../models/scene-listing.model';
import hooks from './scene-listing.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'scene-listing': SceneListing & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/scene-listing', new SceneListing(options, app));

  const service = app.service('scene-listing');

  service.hooks(hooks);
};
