import { RigInterface } from '@etherealengine/common/src/dbmodels/Rig'

import { Application } from '../../../declarations'
import { Rig } from './rig.class'
import rigDocs from './rig.docs'
import hooks from './rig.hooks'
import createModel from './rig.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    rig: Rig
  }
  interface Models {
    rig: ReturnType<typeof createModel> & RigInterface
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
  const event = new Rig(options, app)
  event.docs = rigDocs

  app.use('rig', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('rig')

  service.hooks(hooks)
}
