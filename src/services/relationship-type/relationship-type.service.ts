import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { RelationshipType } from './relationship-type.class'
import createModel from '../../models/relationship-type.model'
import hooks from './relationship-type.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'relationship-type': RelationshipType & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/relationship-type', new RelationshipType(options, app))

  const service = app.service('relationship-type')

  service.hooks(hooks)
}
