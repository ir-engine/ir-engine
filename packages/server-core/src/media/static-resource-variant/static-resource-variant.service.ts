import { Application } from '../../../declarations'
import { StaticResourceVariant } from './static-resource-variant.class'
import staticResourceTypeDocs from './static-resource-variant.docs'
import hooks from './static-resource-variant.hooks'
import createModel from './static-resource-variant.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'static-resource-variant': StaticResourceVariant
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
   */
  const event = new StaticResourceVariant(options, app)
  event.docs = staticResourceTypeDocs
  app.use('static-resource-variant', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('static-resource-variant')

  service.hooks(hooks)
}
