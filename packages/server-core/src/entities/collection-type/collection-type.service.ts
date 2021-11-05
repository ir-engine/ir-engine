import { Application } from '../../../declarations'
import { CollectionType } from './collection-type.class'
import createModel from './collection-type.model'
import hooks from './collection-type.hooks'
import collectionTypeDocs from './collection-type.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'collection-type': CollectionType
  }
  interface Models {
    collection_type: ReturnType<typeof createModel>
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
  const event = new CollectionType(options, app)
  event.docs = collectionTypeDocs
  app.use('collection-type', event)

  const service = app.service('collection-type')

  service.hooks(hooks)
}
