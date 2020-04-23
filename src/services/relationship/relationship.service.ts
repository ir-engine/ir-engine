import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { RelationRelation } from './relationship.class'
import createModel from '../../models/relationship.model'
import hooks from './relationship.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'relationship': RelationRelation & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/relationship', new RelationRelation(options, app))

  const service = app.service('relationship')

  service.hooks(hooks)
}
