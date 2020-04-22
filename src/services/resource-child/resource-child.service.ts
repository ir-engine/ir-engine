import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ResourceChild } from './resource-child.class'
import createModel from '../../models/resource-child.model'
import hooks from './resource-child.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'resource-child': ResourceChild & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/resource-child', new ResourceChild(options, app))

  const service = app.service('resource-child')

  service.hooks(hooks)
}
