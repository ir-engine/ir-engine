import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Project } from './project.class';
import hooks from './project.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'project': Project & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    // Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/project', new Project(options, app));

  const service = app.service('project');

  service.hooks(hooks);
};
