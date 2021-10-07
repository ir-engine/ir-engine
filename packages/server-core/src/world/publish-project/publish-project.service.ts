import { Application } from '../../../declarations'
import { PublishProject } from './publish-project.class'
import publishProjectDocs from './publish-project.docs'
import hooks from './publish-project.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'publish-project': PublishProject
  }
}

export default (app: Application): void => {
  const options = {}

  const event = new PublishProject(options, app)
  event.docs = publishProjectDocs
  app.use('publish-project', event)

  const service = app.service('publish-project')
  service.hooks(hooks)
}
