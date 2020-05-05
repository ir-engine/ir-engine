// Initializes the `PublishProject` service on path `/project/:projectId/publish`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PublishProject } from './publish-project.class'
import hooks from './publish-project.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'project/:projectId/publish': PublishProject & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {}

  // Initialize our service with any options it requires
  app.use('/project/:projectId/publish', new PublishProject(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('project/:projectId/publish')

  service.hooks(hooks)
}
