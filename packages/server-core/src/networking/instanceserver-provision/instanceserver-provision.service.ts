import { Params } from '@feathersjs/feathers/lib/declarations'

import { Application } from '../../../declarations'
import { patchInstanceserverLocation } from './instanceserver-provision-helper'
import hooks from './instanceserver-provision.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'instanceserver-provision': any
  }
}

export default (app: Application): void => {
  app.use('instanceserver-provision', {
    patch: async ({ locationId }, params: Params) => {
      const result = await patchInstanceserverLocation(app, locationId)
      return result
    }
  })

  const service = app.service('instanceserver-provision')

  service.hooks(hooks)
}
