import { createSwaggerServiceOptions } from 'feathers-swagger'

import {
  matchTicketAssignmentQuerySchema,
  matchTicketAssignmentSchema
} from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'

export default createSwaggerServiceOptions({
  schemas: {
    matchTicketAssignmentQuerySchema,
    matchTicketAssignmentSchema
  },
  docs: {
    description: 'Match ticket assignment service description',
    securities: ['all']
  }
})
