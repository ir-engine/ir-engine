import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PublishProject } from './publish-project.class'
import hooks from './publish-project.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'projects/:projectId/publish': PublishProject & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {}

  // Initialize our service with any options it requires
  app.use('/projects/:projectId/publish', new PublishProject(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('projects/:projectId/publish')

  service.hooks(hooks)
}
