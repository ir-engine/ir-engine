import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  emailSettingDataSchema,
  emailSettingPatchSchema,
  emailSettingQuerySchema,
  emailSettingSchema
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    emailSettingDataSchema,
    emailSettingPatchSchema,
    emailSettingQuerySchema,
    emailSettingSchema
  },
  docs: {
    description: 'Email service description',
    securities: ['all']
  }
})
