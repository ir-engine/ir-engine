// Initializes the `feed` service on path `/feed`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Feed } from './feed.class';
import createModel from '../../models/feed.model';
import hooks from './feed.hooks';
import feedDocs from './feed.docs';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'feed': Feed & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const feed = new Feed(options, app);
  feed.docs = feedDocs;
  app.use('/feed', feed);

  // Get our initialized service so that we can register hooks
  const service = app.service('feed');

  service.hooks(hooks);
}
