// Initializes the `feed` service on path `/feed`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { CommentsFire } from './comments-fire.class';
import createModel from '../../models/feed.model';
import hooks from './comments-fire.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'CommentsFire': CommentsFire & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/comments-fire.', new CommentsFire(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('comments-fire.');

  service.hooks(hooks);
}
