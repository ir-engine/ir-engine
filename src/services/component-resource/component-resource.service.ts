// Initializes the `component-resource` service on path `/component-resource`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { ComponentResource } from './component-resource.class'
import createModel from '../../models/component-resource.model'
import hooks from './component-resource.hooks'

// Add this service to the service type index
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

  // Initialize our service with any options it requires
  app.use('/component-resource', new ComponentResource(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('component-resource')

  service.hooks(hooks)
}
