// Initializes the `entity` service on path `/entity`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Entity } from './entity.class'
import createModel from '../../models/entity.model'
import hooks from './entity.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'entity': Entity & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/entity', new Entity(options, app))

  const service = app.service('entity')

  service.hooks(hooks)
}
