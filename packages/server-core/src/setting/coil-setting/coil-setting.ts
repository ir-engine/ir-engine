import { coilSettingMethods, coilSettingPath } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { CoilSettingService } from './coil-setting.class'
import coilSettingDocs from './coil-setting.docs'
import hooks from './coil-setting.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [coilSettingPath]: CoilSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: coilSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(coilSettingPath, new CoilSettingService(options), {
    // A list of all methods this service exposes externally
    methods: coilSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: coilSettingDocs
  })

  const service = app.service(coilSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
