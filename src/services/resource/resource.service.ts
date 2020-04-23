import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Resource } from './resource.class'
import createModel from '../../models/resource.model'
import hooks from './resource.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'resource': Resource & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/resource', new Resource(options, app))

  const service = app.service('resource')

  service.hooks(hooks)
}
