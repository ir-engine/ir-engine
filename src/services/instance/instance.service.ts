import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { LocationInstances } from './instance.class'
import createModel from '../../models/instance.model'
import hooks from './instance.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'instance': LocationInstances & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/instance', new LocationInstances(options, app))

  const service = app.service('instance')

  service.hooks(hooks)
}
