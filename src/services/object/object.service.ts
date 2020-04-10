// Initializes the `Objects` service on path `/objects`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Objects } from './object.class'
import createModel from '../../models/objects.model'
import hooks from './object.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'objects': Objects & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/objects', new Objects(options, app))

  const service = app.service('objects')

  service.hooks(hooks)
}
