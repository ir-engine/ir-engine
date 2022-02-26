import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { InstanceAuthorizedUser as InstanceAuthorizedUserInterface } from '@xrengine/common/src/interfaces/InstanceAuthorizedUser'

import { Application } from '../../../declarations'

export type InstanceAuthorizedUserDataType = InstanceAuthorizedUserInterface

export class InstanceAuthorizedUser<T = InstanceAuthorizedUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
