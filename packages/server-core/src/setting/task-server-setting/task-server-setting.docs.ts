import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  taskServerSettingDataSchema,
  taskServerSettingPatchSchema,
  taskServerSettingQuerySchema,
  taskServerSettingSchema
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'

export default createSwaggerServiceOptions({
  schemas: {
    taskServerSettingDataSchema,
    taskServerSettingPatchSchema,
    taskServerSettingQuerySchema,
    taskServerSettingSchema
  },
  docs: {
    description: 'Task server service description',
    securities: ['all']
  }
})
