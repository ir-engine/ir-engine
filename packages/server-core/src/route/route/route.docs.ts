import { createSwaggerServiceOptions } from 'feathers-swagger'

import { routeDataSchema, routePatchSchema, routeQuerySchema, routeSchema } from './route.schema'

export default createSwaggerServiceOptions({
  schemas: { routeDataSchema, routePatchSchema, routeQuerySchema, routeSchema },
  docs: {
    description: 'Route service description',
    securities: ['all']
  }
})
