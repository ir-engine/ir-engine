import hooks from './authentication.hooks'
import { Application } from '../../../declarations'
import { Authentication } from './authentication.class'
import createModel from './authentication.model'

declare module '../../../declarations' {
  interface SerViceTypes {
    Authentication: Authentication
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Authentication(options, app)
  app.use('authentication-setting', event)

  const service = app.service('authentication-setting')

  service.hooks(hooks)
}
