// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { MatchTicketQuery, MatchTicketType } from '@etherealengine/matchmaking/src/match-ticket.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const matchTicketResolver = resolve<MatchTicketType, HookContext>({})

export const matchTicketExternalResolver = resolve<MatchTicketType, HookContext>({})

export const matchTicketDataResolver = resolve<MatchTicketType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const matchTicketQueryResolver = resolve<MatchTicketQuery, HookContext>({})
