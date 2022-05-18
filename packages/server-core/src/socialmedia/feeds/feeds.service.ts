/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// Initializes the `thefeeds` service on path `/thefeeds`
import { Application } from '../../../declarations'
import { TheFeeds } from './feeds.class'
import createModel from './feeds.model'
import hooks from './feeds.hooks'
import thefeedsDocs from './feeds.docs'

// const thefeeds = '';
// // conts Feeds = '';

// Add this service to the service type index

declare module '../../../declarations' {
  interface ServiceTypes {
    thefeeds: TheFeeds
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const thefeeds = new TheFeeds(options, app)
  thefeeds.docs = thefeedsDocs
  app.use('thefeeds', thefeeds)

  // Get our initialized service so that we can register hooks
  const service = app.service('thefeeds')

  service.hooks(hooks)
}
