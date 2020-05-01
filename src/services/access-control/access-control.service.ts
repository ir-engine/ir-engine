import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { AccessControl } from './access-control.class'
import createModel from '../../models/access-control.model'
import hooks from './access-control.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'access-control': AccessControl & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/access-control', new AccessControl(options, app))

  const service = app.service('access-control')

  service.hooks(hooks)
}
