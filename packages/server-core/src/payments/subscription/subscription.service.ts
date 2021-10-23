import { Application } from '../../../declarations'
import { Subscription } from './subscription.class'
import createModel from './subscription.model'
import hooks from './subscription.hooks'
import subscription from './subscription.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    subscription: Subscription
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Subscription(options, app)
  event.docs = subscription

  app.use('subscription', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('subscription')

  service.hooks(hooks)
}
