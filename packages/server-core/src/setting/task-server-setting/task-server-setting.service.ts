import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { TaskServerSetting } from './task-server-setting.class'
import hooks from './task-server-setting.hooks'
import createModel from './task-server-setting.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'task-server-setting': TaskServerSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new TaskServerSetting(options, app)
  app.use('task-server-setting', event)
  const service = app.service('task-server-setting')
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
