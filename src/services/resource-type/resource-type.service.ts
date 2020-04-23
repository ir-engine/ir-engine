import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ResourceType } from './resource-type.class'
import createModel from '../../models/resource-type.model'
import hooks from './resource-type.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'resource-type': ResourceType & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['remove']
  }

  app.use('/resource-type', new ResourceType(options, app))

  const service = app.service('resource-type')

  service.hooks(hooks)
}
