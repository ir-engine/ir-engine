import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  RedisSettingData,
  RedisSettingPatch,
  RedisSettingQuery,
  RedisSettingType
} from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RedisSettingParams extends KnexAdapterParams<RedisSettingQuery> {}

export class RedisSettingService<
  T = RedisSettingType,
  ServiceParams extends Params = RedisSettingParams
> extends KnexService<RedisSettingType, RedisSettingData, RedisSettingParams, RedisSettingPatch> {}
