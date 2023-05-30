import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  redisSettingDataSchema,
  redisSettingPatchSchema,
  redisSettingQuerySchema,
  redisSettingSchema
} from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    redisSettingDataSchema,
    redisSettingPatchSchema,
    redisSettingQuerySchema,
    redisSettingSchema
  },
  docs: {
    description: 'Redis setting service description',
    securities: ['all']
  }
})
