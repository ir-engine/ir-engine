import { Application } from '../../../declarations'
import { SeatStatus } from './seat-status.class'
import seatStatusDocs from './seat-status.docs'
import hooks from './seat-status.hooks'
import createModel from './seat-status.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'seat-status': SeatStatus
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
  const event = new SeatStatus(options, app)
  event.docs = seatStatusDocs
  app.use('seat-status', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('seat-status')

  service.hooks(hooks)
}
