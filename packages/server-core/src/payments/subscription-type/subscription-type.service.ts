import { Application } from '../../../declarations'
import { SubscriptionType } from './subscription-type.class'
import subscriptionTypeDocs from './subscription-type.docs'
import hooks from './subscription-type.hooks'
import createModel from './subscription-type.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'subscription-type': SubscriptionType
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
  const event = new SubscriptionType(options, app)
  event.docs = subscriptionTypeDocs

  app.use('subscription-type', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('subscription-type')

  service.hooks(hooks)
}
