import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserRelationship } from './user-relationship.class'
import createModel from '../../models/user-relationship.model'
import hooks from './user-relationship.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'user-relationship': UserRelationship & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/user-relationship', new UserRelationship(options, app))

  const service = app.service('user-relationship')

  service.hooks(hooks)
}
