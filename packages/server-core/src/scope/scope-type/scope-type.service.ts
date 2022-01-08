import { Application } from '../../../declarations'
import { ScopeType } from './scope-type.class'
import scopeTypeDocs from './scope-type.docs'
import hooks from './scope-type.hooks'
import createModel from './scope-type.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'scop-type': ScopeType
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ScopeType(options, app)
  event.docs = scopeTypeDocs
  app.use('scope-type', event)

  const service = app.service('scope-type')
  service.hooks(hooks)
}
