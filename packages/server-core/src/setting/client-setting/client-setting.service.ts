import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { ClientSetting } from './client-setting.class'
import hooks from './client-setting.hooks'
import createModel from './client-setting.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'client-setting': ClientSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ClientSetting(options, app)
  app.use('client-setting', event)

  const service = app.service('client-setting')
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
