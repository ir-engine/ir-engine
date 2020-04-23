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

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/collection-entity', new CollectionEntity(options, app))

  const service = app.service('collection-entity')

  service.hooks(hooks)
}
