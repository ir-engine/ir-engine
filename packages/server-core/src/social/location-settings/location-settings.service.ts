// Initializes the `location-settings` service on path `/location-settings`
import { Application } from '../../../declarations'
import { LocationSettings } from './location-settings.class'
import createModel from './location-settings.model'
import hooks from './location-settings.hooks'
import locationSettingsDocs from './location-settings-docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'location-settings': LocationSettings
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
   *
   * @author Vyacheslav Solovjov
   */
  const event = new LocationSettings(options, app)
  event.docs = locationSettingsDocs
  app.use('location-settings', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('location-settings')

  service.hooks(hooks)
}
