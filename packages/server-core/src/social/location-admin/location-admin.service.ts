// Initializes the `location-admin` service on path `/location-admin`
import { Application } from '../../../declarations'
import { LocationAdmin } from './location-admin.class'
import locationAdminDocs from './location-admin.docs'
import hooks from './location-admin.hooks'
import createModel from './location-admin.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'location-admin': LocationAdmin
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new LocationAdmin(options, app)
  event.docs = locationAdminDocs
  app.use('location-admin', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('location-admin')

  service.hooks(hooks)
}
