import {
  serverSettingMethods,
  serverSettingPath
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { ServerSettingService } from './server-setting.class'
import serverSettingDocs from './server-setting.docs'
import hooks from './server-setting.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [serverSettingPath]: ServerSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: serverSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(serverSettingPath, new ServerSettingService(options), {
    // A list of all methods this service exposes externally
    methods: serverSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: serverSettingDocs
  })

  const service = app.service(serverSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
