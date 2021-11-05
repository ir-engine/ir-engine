import { Application } from '../../../declarations'
import { StaticResourceURL } from './static-resource-url.class'
import createModel from './static-resource-url.model'
import hooks from './static-resource-url.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'static-resource-url': StaticResourceURL
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
   * @author Abhishek Pathak
   */
  const event = new StaticResourceURL(options, app)
  app.use('static-resource-url', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Abhishek Pathak
   */
  const service = app.service('static-resource-url')

  service.hooks(hooks)
}
