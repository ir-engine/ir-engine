import { Application } from '../../../declarations'
import { PublishProject } from './publish-scene.class'
import publishProjectDocs from './publish-scene.docs'
import hooks from './publish-scene.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'publish-scene': PublishProject
  }
}

export default (app: Application): void => {
  const options = {}

  const event = new PublishProject(options, app)
  event.docs = publishProjectDocs
  app.use('publish-scene', event)

  const service = app.service('publish-scene')
  service.hooks(hooks)
}
