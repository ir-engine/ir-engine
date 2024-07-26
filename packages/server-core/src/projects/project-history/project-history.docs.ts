import { createSwaggerServiceOptions } from 'feathers-swagger'

import { projectHistoryDataSchema, projectHistoryQuerySchema, projectHistorySchema } from './project-history.schema'

export default createSwaggerServiceOptions({
  schemas: {
    projectHistoryDataSchema,
    projectHistoryQuerySchema,
    projectHistorySchema
  },
  docs: {
    description: 'Project History service description',
    securities: ['all']
  }
})
