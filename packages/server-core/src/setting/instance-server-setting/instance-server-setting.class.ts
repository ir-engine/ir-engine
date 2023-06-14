import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  InstanceServerSettingData,
  InstanceServerSettingPatch,
  InstanceServerSettingQuery,
  InstanceServerSettingType
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InstanceServerSettingParams extends KnexAdapterParams<InstanceServerSettingQuery> {}

export class InstanceServerSettingService<
  T = InstanceServerSettingType,
  ServiceParams extends Params = InstanceServerSettingParams
> extends KnexService<
  InstanceServerSettingType,
  InstanceServerSettingData,
  InstanceServerSettingParams,
  InstanceServerSettingPatch
> {}
