// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { FeedBookmark } from './feed-bookmark.class'
import createModel from './feed-bookmark.model'
import hooks from './feed-bookmark.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    FeedBookmark: FeedBookmark
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('feed-bookmark', new FeedBookmark(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('feed-bookmark')

  service.hooks(hooks)
}
