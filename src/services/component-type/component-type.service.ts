// Initializes the `component-type` service on path `/component-type`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ComponentType } from './component-type.class'
import createModel from '../../models/component-type.model'
import hooks from './component-type.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'component-type': ComponentType & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/component-type', new ComponentType(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('component-type')

  service.hooks(hooks)
}
