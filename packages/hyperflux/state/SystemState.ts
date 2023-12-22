import { isDev } from '@etherealengine/common/src/config'
import { defineState } from '../functions/StateFunctions'

export const SystemState = defineState({
  name: 'ee.meta.SystemState',
  initial: () => ({
    performanceProfilingEnabled: isDev
  })
})
