import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import {
  UserAvatarData,
  UserAvatarPatch,
  UserAvatarQuery,
  UserAvatarType
} from '@etherealengine/engine/src/schemas/user/user-avatar.schema'

export interface UserAvatarParams extends KnexAdapterParams<UserAvatarQuery> {}

export class UserAvatarService<T = UserAvatarType, ServiceParams extends Params = UserAvatarParams> extends KnexService<
  UserAvatarType,
  UserAvatarData,
  UserAvatarParams,
  UserAvatarPatch
> {}
