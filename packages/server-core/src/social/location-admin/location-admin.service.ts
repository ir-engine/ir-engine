// Initializes the `location-admin` service on path `/location-admin`
import { Application } from '../../../declarations'
import { LocationAdmin } from './location-admin.class'
import createModel from './location-admin.model'
import hooks from './location-admin.hooks'
import locationAdminDocs from './location-admin.docs'

// Add this service to the service type index
declare module '../../../declarations' {
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
   *
   * @author Vyacheslav Solovjov
   */
  const event = new LocationAdmin(options, app)
  event.docs = locationAdminDocs
  app.use('location-admin', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('location-admin')

  service.hooks(hooks)
}
