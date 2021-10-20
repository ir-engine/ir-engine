import { Application } from '../../../declarations'
import { SubscriptionLevel } from './subscription-level.class'
import createModel from './subscription-level.model'
import hooks from './subscription-level.hooks'
import subscriptionLevelDocs from './subscription-level.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'subscription-level': SubscriptionLevel
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
  const event = new SubscriptionLevel(options, app)
  event.docs = subscriptionLevelDocs
  app.use('subscription-level', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('subscription-level')

  service.hooks(hooks)
}
