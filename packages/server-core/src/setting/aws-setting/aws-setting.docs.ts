import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  awsSettingDataSchema,
  awsSettingPatchSchema,
  awsSettingQuerySchema,
  awsSettingSchema
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    awsSettingDataSchema,
    awsSettingPatchSchema,
    awsSettingQuerySchema,
    awsSettingSchema
  },
  docs: {
    description: 'Aws service description',
    securities: ['all']
  }
})
