// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { FeedFires } from './feed-fires.class'
import createModel from './feed-fires.model'
import hooks from './feed-fires.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    FeedFires: FeedFires
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('feed-fires', new FeedFires(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('feed-fires')

  service.hooks(hooks)
}
