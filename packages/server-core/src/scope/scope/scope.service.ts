import hooks from './scope.hooks'
import { Application } from '../../../declarations'
import { Scope } from './scope.class'
import createModel from './scope.model'
import scopeDocs from './scope.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    scope: Scope
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Scope(options, app)
  event.docs = scopeDocs
  app.use('scope', event)

  const service = app.service('scope')

  service.hooks(hooks)
}
