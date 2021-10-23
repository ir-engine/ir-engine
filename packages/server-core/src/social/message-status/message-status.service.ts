import { Application } from '../../../declarations'
import { MessageStatus } from './message-status.class'
import createModel from './message-status.model'
import hooks from './message-status.hooks'
import messageStatusDocs from './message-status.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'message-status': MessageStatus
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
   *
   * @author Vyacheslav Solovjov
   */

  const event = new MessageStatus(options, app)
  event.docs = messageStatusDocs
  app.use('message-status', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('message-status')

  service.hooks(hooks)
}
