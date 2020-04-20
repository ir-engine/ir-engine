// TODO: This is a junction table service, this might be solved without the need for an explicit service
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { CollectionEntity } from './collection-entity.class'
import createModel from '../../models/collection-entity.model'
import hooks from './collection-entity.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'collection-entity': CollectionEntity & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/collection-entity', new CollectionEntity(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('collection-entity')

  service.hooks(hooks)
}
