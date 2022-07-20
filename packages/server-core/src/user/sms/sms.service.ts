import { Application } from '../../../declarations'
import { Sms } from './sms.class'
import smsDocs from './sms.docs'
import hooks from './sms.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    sms: Sms
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Sms(options, app)
  event.docs = smsDocs

  app.use('sms', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('sms')

  service.hooks(hooks)
}
