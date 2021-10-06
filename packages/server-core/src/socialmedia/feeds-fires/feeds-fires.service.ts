// Initializes the `thefeeds` service on path `/feeds`
import { Application } from '../../../declarations'
import { TheFeedsFires } from './feeds-fires.class'
import createModel from './feeds-fires.model'
import hooks from './feeds-fires.hooks'

// const thefeeds = '';
// conts TheFeeds = '';

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    TheFeedsFires: TheFeedsFires
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('thefeeds-fires', new TheFeedsFires(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('thefeeds-fires')

  service.hooks(hooks)
}
