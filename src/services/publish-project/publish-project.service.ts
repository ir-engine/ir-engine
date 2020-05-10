import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PublishProject } from './publish-project.class'
import hooks from './publish-project.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'project/:projectId/publish': PublishProject & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {}

  app.use('/project/:projectId/publish', new PublishProject(options, app))

  const service = app.service('project/:projectId/publish')

  service.hooks(hooks)
}
