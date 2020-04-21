// Initializes the `collection` service on path `/collection`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Collection } from './collection.class'
import createModel from '../../models/collection.model'
import hooks from './collection.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'collection': Collection & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/collection', new Collection(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('collection')

  service.hooks(hooks)
}
