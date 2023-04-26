import { awsSettingMethods, awsSettingPath } from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'

import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { AwsSettingService } from './aws-setting.class'
import awsSettingDocs from './aws-setting.docs'
import hooks from './aws-setting.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [awsSettingPath]: AwsSettingService
  }
}

export default (app: Application): void => {
  const options = {
    name: awsSettingPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(awsSettingPath, new AwsSettingService(options), {
    // A list of all methods this service exposes externally
    methods: awsSettingMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: awsSettingDocs
  })

  const service = app.service(awsSettingPath)
  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
