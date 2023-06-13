import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  EmailSettingData,
  EmailSettingPatch,
  EmailSettingQuery,
  EmailSettingType
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmailSettingParams extends KnexAdapterParams<EmailSettingQuery> {}

export class EmailSettingService<
  T = EmailSettingType,
  ServiceParams extends Params = EmailSettingParams
> extends KnexService<EmailSettingType, EmailSettingData, EmailSettingParams, EmailSettingPatch> {}
