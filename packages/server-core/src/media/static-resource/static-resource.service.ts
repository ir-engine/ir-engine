import { Application } from '../../../declarations'
import { StaticResource } from './static-resource.class'
import createModel from './static-resource.model'
import hooks from './static-resource.hooks'
import staticResourceDocs from './static-resource.docs'
import { StaticResourceInterface } from '@xrengine/common/src/dbmodels/StaticResource'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'static-resource': StaticResource
  }
  interface Models {
    static_resource: ReturnType<typeof createModel> & StaticResourceInterface
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
  const event = new StaticResource(options, app)
  event.docs = staticResourceDocs

  app.use('static-resource', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('static-resource')

  service.hooks(hooks)
}
