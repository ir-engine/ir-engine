// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { MatchUserQuery, MatchUserType } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const matchUserResolver = resolve<MatchUserType, HookContext>({})

export const matchUserExternalResolver = resolve<MatchUserType, HookContext>({})

export const matchUserDataResolver = resolve<MatchUserType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const matchUserPatchResolver = resolve<MatchUserType, HookContext>({
  updatedAt: getDateTimeSql
})

export const matchUserQueryResolver = resolve<MatchUserQuery, HookContext>({})
