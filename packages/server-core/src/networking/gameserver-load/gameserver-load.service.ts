import { Application } from '../../../declarations'
import hooks from './gameserver-load.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'gameserver-load': any
  }
}

export default (app: Application): void => {
  app.use('gameserver-load', {
    patch: ({ id, locationId, sceneId }) => {
      return
    }
  })

  const service = app.service('gameserver-load')

  service.hooks(hooks)
}
