import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  chargebeeSettingDataSchema,
  chargebeeSettingPatchSchema,
  chargebeeSettingQuerySchema,
  chargebeeSettingSchema
} from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    chargebeeSettingDataSchema,
    chargebeeSettingPatchSchema,
    chargebeeSettingQuerySchema,
    chargebeeSettingSchema
  },
  docs: {
    description: 'Chargebee service description',
    securities: ['all']
  }
})
