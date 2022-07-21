import { Application } from '../../../declarations'
import { Seat } from './seat.class'
import seatDocs from './seat.docs'
import hooks from './seat.hooks'
import createModel from './seat.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    seat: Seat
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
  const event = new Seat(options, app)
  event.docs = seatDocs
  app.use('seat', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('seat')

  service.hooks(hooks)
}
