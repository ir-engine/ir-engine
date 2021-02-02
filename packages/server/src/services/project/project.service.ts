import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Project } from './project.class';
import projectDocs from './project.docs';
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

  const event = new Project(options, app);
  event.docs = projectDocs;

  app.use('/project', event);

  const service = app.service('project');

  service.hooks(hooks);
};
