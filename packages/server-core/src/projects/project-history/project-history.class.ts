import type { Params } from '@feathersjs/feathers'
import { KnexAdapterParams, KnexService } from '@feathersjs/knex'

import { Application } from '@etherealengine/server-core/declarations'
import { ProjectHistoryData, ProjectHistoryQuery, ProjectHistoryType } from './project-history.schema'

export interface ProjectHistoryParams extends KnexAdapterParams<ProjectHistoryQuery> {}

export class ProjectHistoryService<
  T = ProjectHistoryType,
  ServiceParams extends Params = ProjectHistoryParams
> extends KnexService<ProjectHistoryType, ProjectHistoryData, ProjectHistoryParams> {
  app: Application
}
