// Initializes the `verification-event` service on path `/verification-event`
import { Application } from '../../../declarations'
import { VerificationEvent } from './verification-event.class'
import verificationEventDocs from './verification-event.docs'
import hooks from './verification-event.hooks'
import createModel from './verification-event.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'verification-event': VerificationEvent
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new VerificationEvent(options, app)
  event.docs = verificationEventDocs
  app.use('verification-event', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('verification-event')

  service.hooks(hooks)
}
