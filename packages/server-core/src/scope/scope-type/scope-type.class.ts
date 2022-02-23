import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { AdminScopeType as ScopeTypeInterface } from '@xrengine/common/src/interfaces/AdminScopeType'

export type ScopeTypeDataType = ScopeTypeInterface

export class ScopeType<T = ScopeTypeDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
