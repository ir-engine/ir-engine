import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ResourceType } from './static-resource-type.class'
import createModel from '../../models/static-resource-type.model'
import hooks from './static-resource-type.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'static-resource-type': ResourceType & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/static-resource-type', new ResourceType(options, app))

  const service = app.service('static-resource-type')

  service.hooks(hooks)
}
