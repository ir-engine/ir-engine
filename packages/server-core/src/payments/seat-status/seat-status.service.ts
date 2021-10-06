import { Application } from '../../../declarations'
import { SeatStatus } from './seat-status.class'
import createModel from './seat-status.model'
import hooks from './seat-status.hooks'
import seatStatusDocs from './seat-status.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'seat-status': SeatStatus
  }
}

export default (app: Application): any => {
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
  const event = new SeatStatus(options, app)
  event.docs = seatStatusDocs
  app.use('seat-status', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('seat-status')

  service.hooks(hooks)
}
