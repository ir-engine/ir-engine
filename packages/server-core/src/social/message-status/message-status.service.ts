import { Application } from '../../../declarations'
import { MessageStatus } from './message-status.class'
import messageStatusDocs from './message-status.docs'
import hooks from './message-status.hooks'
import createModel from './message-status.model'

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
