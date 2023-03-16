import { DataInterface } from '@etherealengine/common/src/dbmodels/Data'

import { Application } from '../../../declarations'
import { Data } from './data.class'
import dataDocs from './data.docs'
import hooks from './data.hooks'
import createModel from './data.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    data: Data
  }
  interface Models {
    data: ReturnType<typeof createModel> & DataInterface
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
  const event = new Data(options, app)
  event.docs = dataDocs

  app.use('data', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('data')

  service.hooks(hooks)
}
