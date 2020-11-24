import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PublishProject } from './publish-project.class';
import hooks from './publish-project.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'publish-project': PublishProject & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {};

  app.use('/publish-project', new PublishProject(options, app));

  const service = app.service('publish-project');
  service.hooks(hooks);
};
