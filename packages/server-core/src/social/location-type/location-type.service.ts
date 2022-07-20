// Initializes the `location-type` service on path `/location-type`
import { Application } from '../../../declarations'
import { LocationType } from './location-type.class'
import locationTypeDocs from './location-type.docs'
import hooks from './location-type.hooks'
import createModel from './location-type.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'location-type': LocationType
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new LocationType(options, app)
  event.docs = locationTypeDocs
  app.use('location-type', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('location-type')

  service.hooks(hooks)
}
