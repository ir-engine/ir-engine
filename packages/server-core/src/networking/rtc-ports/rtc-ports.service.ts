// Initializes the `rtc-ports` service on path `/rtc-ports`
import { Application } from '../../../declarations'
import { RtcPorts } from './rtc-ports.class'
import createModel from './rtc-ports.model'
import hooks from './rtc-ports.hooks'
import rtcPortsDocs from './rtc-ports.docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'rtc-ports': RtcPorts
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new RtcPorts(options, app)
  event.docs = rtcPortsDocs
  app.use('rtc-ports', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('rtc-ports')

  service.hooks(hooks)
}
