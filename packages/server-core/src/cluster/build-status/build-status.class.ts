import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { BuildStatus as BuildStatusInterface } from '@etherealengine/common/src/interfaces/BuildStatus'

import { Application } from '../../../declarations'

export class BuildStatus<T = BuildStatusInterface> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
