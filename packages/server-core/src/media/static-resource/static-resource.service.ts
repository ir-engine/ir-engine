import { StaticResourceInterface } from '@xrengine/common/src/dbmodels/StaticResource'

import { Application } from '../../../declarations'
import authenticate from '../../hooks/authenticate'
import verifyScope from '../../hooks/verify-scope'
import { StaticResource } from './static-resource.class'
import staticResourceDocs from './static-resource.docs'
import hooks from './static-resource.hooks'
import createModel from './static-resource.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'static-resource': StaticResource
    'static-resource-filters': any
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
   */
  const event = new StaticResource(options, app)
  event.docs = staticResourceDocs

  app.use('static-resource', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('static-resource')

  app.use('static-resource-filters', {
    get: async (data, params) => {
      return await getFilters(app)
    }
  })

  app.service('static-resource-filters').hooks({
    before: {
      get: [authenticate(), verifyScope('admin', 'admin')]
    }
  })

  service.hooks(hooks)
}

const getFilters = async (app: Application) => {
  const mimeTypes = await app.service('static-resource').Model.findAll({
    attributes: ['mimeType'],
    group: ['mimeType']
  })

  const staticResourceTypes = await app.service('static-resource').Model.findAll({
    attributes: ['staticResourceType'],
    group: ['staticResourceType']
  })

  const allStaticResourceTypes = await app.service('static-resource-type').Model.findAll()

  return {
    mimeTypes: mimeTypes.map((el) => el.mimeType),
    staticResourceTypes: staticResourceTypes.map((el) => el.staticResourceType),
    allStaticResourceTypes: allStaticResourceTypes.map((el) => el.type)
  }
}
