import { CubemapInterface } from '@etherealengine/common/src/dbmodels/Cubemap'

import { Application } from '../../../declarations'
import { Cubemap } from './cubemap.class'
import cubemapDocs from './cubemap.docs'
import hooks from './cubemap.hooks'
import createModel from './cubemap.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    cubemap: Cubemap
  }
  interface Models {
    cubemap: ReturnType<typeof createModel> & CubemapInterface
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Cubemap(options, app)
  event.docs = cubemapDocs

  app.use('cubemap', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('cubemap')

  service.hooks(hooks)
}
