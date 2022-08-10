import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { LocationAuthorizedUser as LocationAuthorizedUserInterface } from '@xrengine/common/src/interfaces/LocationAuthorizedUser'

import { Application } from '../../../declarations'

export type LocationAuthorizedUserDataType = LocationAuthorizedUserInterface

export class LocationAuthorizedUser<T = LocationAuthorizedUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
