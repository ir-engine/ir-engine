// Initializes the `MediaSearch` service on path `/media/search`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { MediaSearch } from './media-search.class';
import hooks from './media-search.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'media/search': MediaSearch & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/media/search', new MediaSearch(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('media/search')

  service.hooks(hooks)
}
