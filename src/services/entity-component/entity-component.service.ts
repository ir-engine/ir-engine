// Initializes the `entity-component` service on path `/entity-component`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { EntityComponent } from './entity-component.class'
import createModel from '../../models/entity-component.model'
import hooks from './entity-component.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'entity-component': EntityComponent & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/entity-component', new EntityComponent(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('entity-component')

  service.hooks(hooks)
}
