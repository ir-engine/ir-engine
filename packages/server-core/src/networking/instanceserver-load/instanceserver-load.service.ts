import { Application } from '../../../declarations'
import hooks from './instanceserver-load.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'instanceserver-load': any
  }
}

export default (app: Application): void => {
  app.use('instanceserver-load', {
    patch: ({ id, ipAddress, podName, locationId, sceneId }) => {
      return { id, ipAddress, podName, locationId, sceneId }
    }
  })

  const service = app.service('instanceserver-load')

  service.hooks(hooks)
}
