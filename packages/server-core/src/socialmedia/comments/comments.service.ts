// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { Comments } from './comments.class'
import createModel from './comments.model'
import hooks from './comments.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    Comments: Comments
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('comments', new Comments(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('comments')

  service.hooks(hooks)
}
