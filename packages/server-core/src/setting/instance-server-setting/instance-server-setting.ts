import {
  instanceServerSettingMethods,
  instanceServerSettingPath
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { InstanceServerSettingService } from './instance-server-setting.class'
import instanceServerSettingDocs from './instance-server-setting.docs'
import hooks from './instance-server-setting.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [instanceServerSettingPath]: InstanceServerSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: instanceServerSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(instanceServerSettingPath, new InstanceServerSettingService(options), {
    // A list of all methods this service exposes externally
    methods: instanceServerSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceServerSettingDocs
  })

  const service = app.service(instanceServerSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
