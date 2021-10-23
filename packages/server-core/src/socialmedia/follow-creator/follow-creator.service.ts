import { Application } from '../../../declarations'
import { FollowCreator } from './follow-creator.class'
import createModel from './follow-creator.model'
import hooks from './follow-creator.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'follow-creator': FollowCreator
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('follow-creator', new FollowCreator(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('follow-creator')

  service.hooks(hooks)
}
