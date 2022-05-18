import { Application } from '../../../declarations'
import { SubscriptionConfirm } from './subscription-confirm.class'
import hooks from './subscription-confirm.hooks'
import config from '../../appconfig'
import subscriptionConfirmDocs from './subscription-confirm.docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'subscription-confirm': SubscriptionConfirm
  }
}

export default (app: Application) => {
  const options = {
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new SubscriptionConfirm(options, app)
  event.docs = subscriptionConfirmDocs

  app.use('subscription-confirm', event, (req, res) => {
    res.redirect(config.client.url)
  })

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('subscription-confirm')

  service.hooks(hooks)
}
