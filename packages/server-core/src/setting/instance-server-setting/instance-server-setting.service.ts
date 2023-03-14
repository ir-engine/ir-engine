import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { InstanceServerSetting } from './instance-server-setting.class'
import hooks from './instance-server-setting.hooks'
import createModel from './instance-server-setting.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'instance-server-setting': InstanceServerSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new InstanceServerSetting(options, app)
  app.use('instance-server-setting', event)

  const service = app.service('instance-server-setting')

  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
