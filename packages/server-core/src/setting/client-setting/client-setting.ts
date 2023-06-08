import {
  clientSettingMethods,
  clientSettingPath
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { ClientSettingService } from './client-setting.class'
import clientSettingDocs from './client-setting.docs'
import hooks from './client-setting.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [clientSettingPath]: ClientSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: clientSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(clientSettingPath, new ClientSettingService(options, app), {
    // A list of all methods this service exposes externally
    methods: clientSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: clientSettingDocs
  })

  const service = app.service(clientSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
