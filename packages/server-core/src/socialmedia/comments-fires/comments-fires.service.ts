// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { CommentsFire } from './comments-fires.class'
import createModel from './comments-fires.model'
import hooks from './comments-fires.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    CommentsFire: CommentsFire
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('comments-fires', new CommentsFire(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('comments-fires')

  service.hooks(hooks)
}
