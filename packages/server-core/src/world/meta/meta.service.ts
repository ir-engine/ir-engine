import { Application } from '../../../declarations'
import { Meta } from './meta.class'
import metaDocs from './meta.docs'
import hooks from './meta.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    meta: Meta
  }
}

export default (app: Application): void => {
  const options = {}

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Meta(options, app)
  event.docs = metaDocs

  app.use('meta', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('meta')

  service.hooks(hooks)
}
