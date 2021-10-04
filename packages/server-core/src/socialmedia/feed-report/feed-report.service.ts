/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { FeedReport } from './feed-report.class'
import createModel from './feed-report.model'
import hooks from './feed-report.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    FeedReport: FeedReport
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('feed-report', new FeedReport(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('feed-report')

  service.hooks(hooks)
}
