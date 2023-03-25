import { SerializedEntityInterface } from '@etherealengine/common/src/dbmodels/SerializedEntity'

import { Application } from '../../../declarations'
import { SerializedEntity } from './serialized-entity.class'
import serializedEntityDocs from './serialized-entity.docs'
import hooks from './serialized-entity.hooks'
import createModel from './serialized-entity.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'serialized-entity': SerializedEntity
  }
  interface Models {
    serializedEntity: ReturnType<typeof createModel> & SerializedEntityInterface
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
  const event = new SerializedEntity(options, app)
  event.docs = serializedEntityDocs

  app.use('serialized-entity', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('serialized-entity')

  service.hooks(hooks)
}
