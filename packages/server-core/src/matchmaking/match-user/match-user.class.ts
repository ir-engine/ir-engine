import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  MatchUserData,
  MatchUserPatch,
  MatchUserQuery,
  MatchUserType
} from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'

export interface MatchUserParams extends KnexAdapterParams<MatchUserQuery> {}

export class MatchUserService<T = MatchUserType, ServiceParams extends Params = MatchUserParams> extends KnexService<
  MatchUserType,
  MatchUserData,
  MatchUserParams,
  MatchUserPatch
> {}
