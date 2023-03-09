import { Application } from '../../../declarations'
import appconfig from '../../appconfig'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { updateAppConfig } from '../../updateAppConfig'
import authentication from '../../user/authentication'
import { Authentication } from './authentication.class'
import hooks from './authentication.hooks'
import createModel from './authentication.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'authentication-setting': Authentication
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
