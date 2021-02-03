import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ProjectAsset } from './project-asset.class';
import createModel from '../../models/project-asset.model';
import hooks from './project-asset.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'project-asset': ProjectAsset & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/project-asset', new ProjectAsset(options, app));

  const service = app.service('project-asset');

  service.hooks(hooks);
};
