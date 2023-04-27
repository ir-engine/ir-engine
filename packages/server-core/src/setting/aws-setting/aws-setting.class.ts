import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  AwsSettingData,
  AwsSettingPatch,
  AwsSettingQuery,
  AwsSettingType
} from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'

export interface AwsSettingParams extends KnexAdapterParams<AwsSettingQuery> {}

export class AwsSettingService<T = AwsSettingType, ServiceParams extends Params = AwsSettingParams> extends KnexService<
  AwsSettingType,
  AwsSettingData,
  AwsSettingParams,
  AwsSettingPatch
> {}
