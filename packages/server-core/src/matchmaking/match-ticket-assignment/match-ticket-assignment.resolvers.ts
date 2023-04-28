// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'

import {
  MatchTicketAssignmentQuery,
  MatchTicketAssignmentType
} from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

export const matchTicketAssignmentResolver = resolve<MatchTicketAssignmentType, HookContext>({})

export const matchTicketAssignmentExternalResolver = resolve<MatchTicketAssignmentType, HookContext>({})

export const matchTicketAssignmentQueryResolver = resolve<MatchTicketAssignmentQuery, HookContext>({})
