import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  instanceServerSettingDataSchema,
  instanceServerSettingPatchSchema,
  instanceServerSettingQuerySchema,
  instanceServerSettingSchema
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    instanceServerSettingDataSchema,
    instanceServerSettingPatchSchema,
    instanceServerSettingQuerySchema,
    instanceServerSettingSchema
  },
  docs: {
    description: 'Instance server setting service description',
    securities: ['all']
  }
})
