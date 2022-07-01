import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ProjectPermissionType as ProjectPermissionTypeInterface } from '@xrengine/common/src/interfaces/ProjectPermissionType'

import { Application } from '../../../declarations'

export type ProjectPermissionTypeDataType = ProjectPermissionTypeInterface

export class ProjectPermissionType<T = ProjectPermissionTypeDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
