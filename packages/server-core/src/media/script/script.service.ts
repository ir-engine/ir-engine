import { ScriptInterface } from '@etherealengine/common/src/dbmodels/Script'

import { Application } from '../../../declarations'
import { Script } from './script.class'
import scriptDocs from './script.docs'
import hooks from './script.hooks'
import createModel from './script.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    script: Script
  }
  interface Models {
    script: ReturnType<typeof createModel> & ScriptInterface
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
  const event = new Script(options, app)
  event.docs = scriptDocs

  app.use('script', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('script')

  service.hooks(hooks)
}
