// Initializes the `instance` service on path `/instance`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Instance } from './instance.class'
import createModel from '../../models/instance.model'
import hooks from './instance.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'instance': Instance & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/instance', new Instance(options, app))

  const service = app.service('instance')

  service.hooks(hooks)
}
