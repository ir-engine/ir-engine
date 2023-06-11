import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  analyticsDataSchema,
  analyticsPatchSchema,
  analyticsQuerySchema,
  analyticsSchema
} from '@etherealengine/engine/src/schemas/analytics/analytics.schema'

export default createSwaggerServiceOptions({
  schemas: { analyticsDataSchema, analyticsPatchSchema, analyticsQuerySchema, analyticsSchema },
  docs: {
    description: 'Analytics service description',
    securities: ['all']
  }
})
