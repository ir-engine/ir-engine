import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { CoilSetting } from './coil-setting.class'
import hooks from './coil-setting.hooks'
import createModel from './coil-setting.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'coil-setting': CoilSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new CoilSetting(options, app)
  app.use('coil-setting', event)
  const service = app.service('coil-setting')
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
