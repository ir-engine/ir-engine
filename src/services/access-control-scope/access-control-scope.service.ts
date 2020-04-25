import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { AccessControlScope } from './access-control-scope.class'
import createModel from '../../models/access-control-scope.model'
import hooks from './access-control-scope.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'access-control-scope': AccessControlScope & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/access-control-scope', new AccessControlScope(options, app))

  const service = app.service('access-control-scope')

  service.hooks(hooks)
}
