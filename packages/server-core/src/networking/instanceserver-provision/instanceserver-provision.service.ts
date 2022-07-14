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
      return patchInstanceserverLocation(app, locationId)
    }
  })

  const service = app.service('instanceserver-provision')

  service.hooks(hooks)
}
