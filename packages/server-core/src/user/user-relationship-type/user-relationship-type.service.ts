import { Application } from '../../../declarations'
import { UserRelationshipType } from './user-relationship-type.class'
import createModel from './user-relationship-type.model'
import hooks from './user-relationship-type.hooks'
import userRelationshipTypeDocs from './user-relationship-type.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'user-relationship-type': UserRelationshipType
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new UserRelationshipType(options, app)
  event.docs = userRelationshipTypeDocs
  app.use('user-relationship-type', event)

  const service = app.service('user-relationship-type')

  service.hooks(hooks)
}
