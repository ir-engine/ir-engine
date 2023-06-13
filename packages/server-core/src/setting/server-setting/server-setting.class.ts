import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  ServerSettingData,
  ServerSettingPatch,
  ServerSettingQuery,
  ServerSettingType
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServerSettingParams extends KnexAdapterParams<ServerSettingQuery> {}

export class ServerSettingService<
  T = ServerSettingType,
  ServiceParams extends Params = ServerSettingParams
> extends KnexService<ServerSettingType, ServerSettingData, ServerSettingParams, ServerSettingPatch> {}
