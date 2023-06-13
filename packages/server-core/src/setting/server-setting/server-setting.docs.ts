import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  serverSettingDataSchema,
  serverSettingPatchSchema,
  serverSettingQuerySchema,
  serverSettingSchema
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    serverSettingDataSchema,
    serverSettingPatchSchema,
    serverSettingQuerySchema,
    serverSettingSchema
  },
  docs: {
    description: 'Server setting service description',
    securities: ['all']
  }
})
