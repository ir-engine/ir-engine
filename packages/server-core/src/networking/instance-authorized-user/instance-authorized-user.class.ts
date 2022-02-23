import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { InstanceAuthorizedUser as InstanceAuthorizedUserInterface } from '@xrengine/common/src/interfaces/InstanceAuthorizedUser'

export type InstanceAuthorizedUserDataType = InstanceAuthorizedUserInterface

export class InstanceAuthorizedUser<T = InstanceAuthorizedUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
