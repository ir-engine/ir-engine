import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  ChargebeeSettingData,
  ChargebeeSettingPatch,
  ChargebeeSettingQuery,
  ChargebeeSettingType
} from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChargebeeSettingParams extends KnexAdapterParams<ChargebeeSettingQuery> {}

export class ChargebeeSettingService<
  T = ChargebeeSettingType,
  ServiceParams extends Params = ChargebeeSettingParams
> extends KnexService<ChargebeeSettingType, ChargebeeSettingData, ChargebeeSettingParams, ChargebeeSettingPatch> {}
