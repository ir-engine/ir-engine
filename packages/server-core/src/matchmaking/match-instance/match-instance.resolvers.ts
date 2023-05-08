// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import {
  MatchInstanceQuery,
  MatchInstanceType
} from '@etherealengine/engine/src/schemas/matchmaking/match-instance.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const matchInstanceResolver = resolve<MatchInstanceType, HookContext>({})

export const matchInstanceExternalResolver = resolve<MatchInstanceType, HookContext>({})

export const matchInstanceDataResolver = resolve<MatchInstanceType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const matchInstancePatchResolver = resolve<MatchInstanceType, HookContext>({
  updatedAt: getDateTimeSql
})

export const matchInstanceQueryResolver = resolve<MatchInstanceQuery, HookContext>({})
