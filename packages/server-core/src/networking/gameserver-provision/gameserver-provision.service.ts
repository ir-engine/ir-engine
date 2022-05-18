import { Params } from '@feathersjs/feathers/lib/declarations'

import { Application } from '../../../declarations'
import { patchGameserverLocation } from './gameserver-provision-helper'
import hooks from './gameserver-provision.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'gameserver-provision': any
  }
}

export default (app: Application): void => {
  app.use('gameserver-provision', {
    patch: async ({ locationId }, params: Params) => {
      const result = await patchGameserverLocation(app, locationId)
      return result
    }
  })

  const service = app.service('gameserver-provision')

  service.hooks(hooks)
}
