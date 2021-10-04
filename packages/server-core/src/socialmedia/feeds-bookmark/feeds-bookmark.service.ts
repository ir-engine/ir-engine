// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { TheFeedsBookmark } from './feeds-bookmark.class'
import createModel from './feeds-bookmark.model'
import hooks from './feeds-bookmark.hooks'

// const thefeeds = '';
// conts TheFeeds = '';

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    TheFeedsBookmark: TheFeedsBookmark
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('thefeeds-bookmark', new TheFeedsBookmark(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('thefeeds-bookmark')

  service.hooks(hooks)
}
