import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ComponentResource } from './component-resource.class'
import createModel from '../../models/component-resource.model'
import hooks from './component-resource.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'component-resource': ComponentResource & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/component-resource', new ComponentResource(options, app))

  const service = app.service('component-resource')

  service.hooks(hooks)
}
