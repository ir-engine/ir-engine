import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  CoilSettingData,
  CoilSettingPatch,
  CoilSettingQuery,
  CoilSettingType
} from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CoilSettingParams extends KnexAdapterParams<CoilSettingQuery> {}

export class CoilSettingService<
  T = CoilSettingType,
  ServiceParams extends Params = CoilSettingParams
> extends KnexService<CoilSettingType, CoilSettingData, CoilSettingParams, CoilSettingPatch> {}
