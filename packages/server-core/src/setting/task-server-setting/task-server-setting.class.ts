import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import {
  TaskServerSettingData,
  TaskServerSettingPatch,
  TaskServerSettingQuery,
  TaskServerSettingType
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'

export interface TaskServerSettingParams extends KnexAdapterParams<TaskServerSettingQuery> {}

export class TaskServerSettingService<
  T = TaskServerSettingType,
  ServiceParams extends Params = TaskServerSettingParams
> extends KnexService<TaskServerSettingType, TaskServerSettingData, TaskServerSettingParams, TaskServerSettingPatch> {}
