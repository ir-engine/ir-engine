// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { FeedLikes } from './feed-likes.class'
import createModel from './feed-likes.model'
import hooks from './feed-likes.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    Feedlikes: FeedLikes
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('feed-likes', new FeedLikes(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('feed-likes')

  service.hooks(hooks)
}
