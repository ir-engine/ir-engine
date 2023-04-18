import {
  taskServerSettingMethods,
  taskServerSettingPath
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { TaskServerSettingService } from './task-server-setting.class'
import taskServerSettingDocs from './task-server-setting.docs'
import hooks from './task-server-setting.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [taskServerSettingPath]: TaskServerSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: taskServerSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(taskServerSettingPath, new TaskServerSettingService(options), {
    // A list of all methods this service exposes externally
    methods: taskServerSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: taskServerSettingDocs
  })

  const service = app.service(taskServerSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
