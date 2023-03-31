import { MaterialInterface } from '@etherealengine/common/src/dbmodels/Material'

import { Application } from '../../../declarations'
import { Material } from './material.class'
import materialDocs from './material.docs'
import hooks from './material.hooks'
import createModel from './material.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    material: Material
  }
  interface Models {
    material: ReturnType<typeof createModel> & MaterialInterface
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
  const event = new Material(options, app)
  event.docs = materialDocs

  app.use('material', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('material')

  service.hooks(hooks)
}
