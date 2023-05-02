import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  matchInstanceDataSchema,
  matchInstancePatchSchema,
  matchInstanceQuerySchema,
  matchInstanceSchema
} from '@etherealengine/engine/src/schemas/matchmaking/match-instance.schema'

export default createSwaggerServiceOptions({
  schemas: {
    matchInstanceDataSchema,
    matchInstancePatchSchema,
    matchInstanceQuerySchema,
    matchInstanceSchema
  },
  docs: {
    description: 'Match instance service description',
    securities: ['all']
  }
})
